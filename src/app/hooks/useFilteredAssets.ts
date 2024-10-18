import { useMemo } from 'react';
import { useCheckAsset } from '@hooks/useCheckAsset';
import { Asset } from '@utils/interface';
import { addAsset } from '@utils/api';

export function useFilteredAssets(sortedAssets: Asset[], searchTerm: string) {
  const formattedSearchTerm = useMemo(() => {
    if (searchTerm.length === 64) {
      return `0x${searchTerm}`;
    }
    return searchTerm;
  }, [searchTerm]);
  const assetFromId = useCheckAsset(formattedSearchTerm.length === 66 ? formattedSearchTerm : null);
  const filteredAssets = useMemo(() => {
    if (formattedSearchTerm.length === 66) {
      if (assetFromId) {
        addAsset(assetFromId);
      }
      return assetFromId ? [assetFromId] : [];
    } else if (searchTerm.length === 0) {
      return sortedAssets;
    }
    
    let filteredList = sortedAssets;
    const searchTermLower = searchTerm.toLowerCase();
    
    for (let i = 0; i < searchTermLower.length; i++) {
      filteredList = filteredList.filter(asset => 
        asset.symbol.toLowerCase()[i] === searchTermLower[i]
      );
      
      if (filteredList.length === 0) break;
    }
    
    return filteredList;
  }, [sortedAssets, searchTerm, formattedSearchTerm, assetFromId]);

  return filteredAssets;
}