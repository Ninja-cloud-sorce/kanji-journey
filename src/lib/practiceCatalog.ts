import { BookOpen, Headphones, MessageSquare } from 'lucide-react';
import readingData from '@/data/japanese/reading.json';
import vocabData from '@/data/japanese/vocab.json';
import particleData from '@/data/japanese/particles.json';
import grammarData from '@/data/japanese/grammar.json';
import { LEGACY_COLLECTIONS } from '@/lib/legacyCurriculum';
import type { SessionType } from '@/store/useStore';

const collectionById = new Map(LEGACY_COLLECTIONS.map((collection) => [collection.id, collection]));

export interface PracticeSessionCard {
  id: string;
  type: SessionType;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof BookOpen;
  itemCount: number;
  collectionLabel: string;
}

function getCollectionLabel(collectionIds: string[]) {
  const labels = collectionIds
    .map((id) => collectionById.get(id)?.title)
    .filter((label): label is string => Boolean(label));

  if (labels.length === 0) return 'All collections';
  if (labels.length === 1) return labels[0];
  return `${labels[0]} +${labels.length - 1} more`;
}

function uniqueCollectionIds(items: Array<{ collection_id?: string | null }>) {
  return Array.from(
    new Set(
      items
        .map((item) => item.collection_id)
        .filter((value): value is string => Boolean(value))
    )
  );
}

export function getPracticeSessionCards(): PracticeSessionCard[] {
  const readingCollectionIds = uniqueCollectionIds(readingData);
  const vocabCollectionIds = uniqueCollectionIds(vocabData);
  const grammarCollectionIds = uniqueCollectionIds([...particleData, ...grammarData]);

  return [
    {
      id: 'reading-practice',
      type: 'reading',
      title: 'Reading Practice',
      subtitle: `${readingData.length} passage${readingData.length === 1 ? '' : 's'} ready`,
      description: 'Work through guided passages with translation support and comprehension checks.',
      icon: BookOpen,
      itemCount: readingData.length,
      collectionLabel: getCollectionLabel(readingCollectionIds),
    },
    {
      id: 'vocabulary-quiz',
      type: 'vocab',
      title: 'Vocabulary Quiz',
      subtitle: `${vocabData.length} term${vocabData.length === 1 ? '' : 's'} queued`,
      description: 'Practice recall with multiple-choice prompts pulled from the live vocabulary set.',
      icon: Headphones,
      itemCount: vocabData.length,
      collectionLabel: getCollectionLabel(vocabCollectionIds),
    },
    {
      id: 'grammar-ritual',
      type: 'grammar',
      title: 'Grammar Ritual',
      subtitle: `${particleData.length + grammarData.length} exercise${particleData.length + grammarData.length === 1 ? '' : 's'} available`,
      description: 'Review grammar and particle patterns using the current sentence bank.',
      icon: MessageSquare,
      itemCount: particleData.length + grammarData.length,
      collectionLabel: getCollectionLabel(grammarCollectionIds),
    },
  ];
}
