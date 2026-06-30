import { useQuery } from '@tanstack/react-query';
import particleData from '@/data/japanese/particles.json';
import grammarData from '@/data/japanese/grammar.json';

export interface GrammarQuestion {
  id: string;
  pattern?: string;
  usage: string;
  sentence: string;
  translation: string;
  options: string[];
  correct: string;
  explanation: string;
  collection_id: string;
}

export function useGrammarExercises(collectionId?: string | null) {
  return useQuery({
    queryKey: ['grammar-exercises', collectionId],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // Merge particle and grammar datasets for a comprehensive ritual
      const merged: GrammarQuestion[] = [
        ...particleData as GrammarQuestion[],
        ...grammarData as GrammarQuestion[]
      ];
      
      let data = merged;
      if (collectionId) {
        const filteredData = data.filter(q => q.collection_id === collectionId);
        data = filteredData.length > 0 ? filteredData : data;
      }
      
      return [...data].sort(() => Math.random() - 0.5);
    },
  });
}
