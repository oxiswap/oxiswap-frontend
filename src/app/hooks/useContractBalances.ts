import { useState, useEffect } from 'react';
import { FUEL_PROVIDER_URL } from '@utils/interface';

interface ContractBalance {
  amount: string;
  assetId: string;
}

interface ContractBalancesResponse {
  contractBalances: {
    nodes: ContractBalance[];
  };
}

export const useContractBalances = ({ contractId }: { contractId: string }) => {
  const [balances, setBalances] = useState<ContractBalance[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const CONTRACT_BALANCES_QUERY = `query ContractBalances($filter: ContractBalanceFilterInput!) {
    contractBalances(filter: $filter, first: 100) {
      nodes {
        amount
        assetId
      }
    }
  }`;
  
  const CONTRACT_BALANCES_ARGS = {
    filter: {
      contract: contractId,
    },
  };

  useEffect(() => {
    const fetchContractBalances = async () => {
      if (!contractId) {
        setBalances([]);
        setError(null);
        return;
      }

      try {
        const response = await fetch(FUEL_PROVIDER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            query: CONTRACT_BALANCES_QUERY,
            variables: CONTRACT_BALANCES_ARGS,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const json: { data: ContractBalancesResponse } = await response.json();
        setBalances(json.data.contractBalances.nodes);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      }
    };

    fetchContractBalances();
  }, [contractId]);

  return { balances, error };
};