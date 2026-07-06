import { useQuery } from '@tanstack/react-query';
import readingData from '@/data/japanese/reading.json';
import { queryKeys } from './queryKeys';

export interface ReadingPassage {
  id: string;
  title: string;
  text: string;
  translation: string;
  questions: Array<{
    q: string;
    options: string[];
    correct: string;
  }>;
  collection_id: string;
}

export function useReadingPassages(collectionId?: string | null) {
  return useQuery({
    queryKey: queryKeys.readingPassages(collectionId),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      let data = readingData as ReadingPassage[];
      
      if (collectionId) {
        const filteredData = data.filter(q => q.collection_id === collectionId);
        data = filteredData.length > 0 ? filteredData : data;
      }
      
      // We don't shuffle reading passages as they are usually structured sequentially
      return data;
    },
  });
}
