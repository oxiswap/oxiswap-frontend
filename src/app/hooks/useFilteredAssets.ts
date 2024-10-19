import { useState, useMemo, useEffect, useCallback } from 'react';
import { Asset, IAsset } from '@utils/interface';
import { useContractBalances } from '@hooks/useContractBalances';
import { useStores } from '@stores/useStores';
import { Src20Standard } from '@blockchain/Src20Standard';
import { Account } from 'fuels';
import { addAsset } from '@utils/api';

const ASSETS_PER_PAGE = 8;

export function useFilteredAssets(sortedAssets: Asset[], searchTerm: string) {
  const [contractAssets, setContractAssets] = useState<Asset[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { accountStore } = useStores();
  const wallet = accountStore.getWallet as Account;

  const formattedSearchTerm = useMemo(() => {
    return searchTerm.length === 64 ? `0x${searchTerm}` : searchTerm;
  }, [searchTerm]);

  const shouldFetchBalances = formattedSearchTerm.length === 66;
  const searchTermToContract = shouldFetchBalances ? formattedSearchTerm : '';

  const { balances, error } = useContractBalances({ contractId: searchTermToContract });

  const loadMoreAssets = useCallback(async () => {
    if (!shouldFetchBalances) return;

    setIsLoading(true);
    if (balances.length > 0) {
      const startIndex = (page - 1) * ASSETS_PER_PAGE;
      const endIndex = startIndex + ASSETS_PER_PAGE;
      const balancesToProcess = balances.slice(startIndex, endIndex);

      if (balancesToProcess.length === 0) {
        setHasMore(false);
        setIsLoading(false);
        setIsInitialLoad(false);
        return;
      }

      const src20 = new Src20Standard(wallet);
      const multiCallPromises = balancesToProcess.flatMap((balance) => [
        src20.instance.functions.get_name({ bits: searchTermToContract }, { bits: balance.assetId }),
        src20.instance.functions.get_symbol({ bits: searchTermToContract }, { bits: balance.assetId }),
        src20.instance.functions.get_decimals({ bits: searchTermToContract }, { bits: balance.assetId })
      ]);

      try {
        const { value: results } = await src20.instance.multiCall(multiCallPromises).get();

        const newAssets: Asset[] = [];
        for (let i = 0; i < results.length; i += 3) {
          const name = results[i] === undefined ? "unknown" : results[i];
          const symbol = results[i + 1] === undefined ? "unknown" : results[i + 1];
          const decimals = results[i + 2] === undefined ? 0 : results[i + 2];
          const assetId = balancesToProcess[i / 3].assetId;

          const asset = IAsset.new(name, "", symbol, assetId, decimals, formattedSearchTerm, "", "");
          newAssets.push(asset);
          addAsset(asset);
        }

        setContractAssets(prevAssets => [...prevAssets, ...newAssets]);
        setHasMore(endIndex < balances.length);
        setPage(prevPage => prevPage + 1);
      } catch (error) {
        console.error('Error in multiCall:', error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    } else {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [shouldFetchBalances, balances, page, formattedSearchTerm, wallet]);

  useEffect(() => {
    setContractAssets([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(true);
    setIsInitialLoad(true);
    if (shouldFetchBalances && balances.length > 0) {
      loadMoreAssets();
    } else if (!shouldFetchBalances) {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [shouldFetchBalances, formattedSearchTerm, balances]);

  const filteredAssets = useMemo(() => {
    if (searchTerm.length === 0) {
      return sortedAssets;
    }
    
    if (shouldFetchBalances) {
      return contractAssets;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    return sortedAssets.filter(asset => 
      asset.symbol.toLowerCase().startsWith(searchTermLower)
    );
  }, [sortedAssets, searchTerm, shouldFetchBalances, contractAssets]);

  return { 
    filteredAssets, 
    loadMoreAssets: shouldFetchBalances ? loadMoreAssets : undefined, 
    hasMore: shouldFetchBalances ? hasMore : false,
    isLoading,
    isInitialLoad
  };
}