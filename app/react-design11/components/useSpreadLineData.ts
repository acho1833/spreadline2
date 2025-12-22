'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SpreadLineData } from './types';

const QUERY_KEY = ['spreadline-data'];

/**
 * Custom hook for fetching and managing SpreadLine data using TanStack Query
 *
 * @param url - URL to fetch JSON data from
 * @param initialData - Optional initial data to use (for mock data scenarios)
 * @returns Object containing data, loading state, error, and setData function
 */
export function useSpreadLineData(url: string, initialData?: SpreadLineData) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<SpreadLineData>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch SpreadLine data');
      }
      return response.json();
    },
    // Use initialData if provided (for mock data scenarios)
    initialData: initialData,
    // Don't refetch on window focus for this visualization
    refetchOnWindowFocus: false,
    // Keep data in cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Update the data in the cache
   * This allows external components (like DataEditor) to update the visualization
   */
  const setData = (newData: SpreadLineData) => {
    queryClient.setQueryData<SpreadLineData>(QUERY_KEY, newData);
  };

  /**
   * Refetch data from the server
   */
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    setData,
    refetch,
  };
}

/**
 * Provider wrapper for TanStack Query
 * Must be used at the app level or in a layout component
 */
export { QueryClient, QueryClientProvider } from '@tanstack/react-query';
