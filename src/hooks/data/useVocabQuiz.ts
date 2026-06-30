import { useQuery } from '@tanstack/react-query';
import vocabData from '@/data/japanese/vocab.json';

export interface VocabQuestion {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  options: string[];
  correct: string;
  example: string;
  collection_id: string;
}

export function useVocabQuiz(collectionId?: string | null) {
  return useQuery({
    queryKey: ['vocab-quiz', collectionId],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      let data = vocabData as VocabQuestion[];
      
      if (collectionId) {
        const filteredData = data.filter(q => q.collection_id === collectionId);
        data = filteredData.length > 0 ? filteredData : data;
      }
      
      // Shuffle for each session
      return [...data].sort(() => Math.random() - 0.5);
    },
  });
}
