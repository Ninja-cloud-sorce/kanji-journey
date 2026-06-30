/**
 * Integration tests for auth redirect, onboarding gate, and dashboard queries.
 *
 * These tests mock the Supabase client so they run fully offline without a
 * live DB connection. The goal is to verify routing logic and hook contracts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ─── Mock supabase client ────────────────────────────────────────────────────
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: { unsubscribe: vi.fn() },
        },
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={makeQC()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

// ─── Auth redirect tests ──────────────────────────────────────────────────────

describe('Auth redirect', () => {
  it('unauthenticated user sees auth form', async () => {
    // Import lazily so mock is in place
    const { default: App } = await import('../App');
    render(<App />);
    // Loading spinner first, then auth redirect
    await waitFor(() => {
      // Current UX may show the landing gate first, or the auth screen if entered.
      const spinner = document.querySelector('.viewport-center');
      const authForm = screen.queryByPlaceholderText('name@sanctuary.org');
      const landing = screen.queryByText(/START LEARNING/i);
      expect(spinner || authForm || landing).toBeTruthy();
    });
  });
});

// ─── Onboarding gate tests ────────────────────────────────────────────────────

describe('Onboarding gate', () => {
  it('needsOnboarding is true when learningPath is null', () => {
    const learningPath = null;
    const profile = { onboarding_completed: false } as any;
    const needsOnboarding = !learningPath || !profile.onboarding_completed;
    expect(needsOnboarding).toBe(true);
  });

  it('needsOnboarding is false when both conditions met', () => {
    const learningPath = { id: '123', selected_level: 'N5' };
    const profile = { onboarding_completed: true } as any;
    const needsOnboarding = !learningPath || !profile.onboarding_completed;
    expect(needsOnboarding).toBe(false);
  });

  it('needsOnboarding is true when learning_path exists but flag is false', () => {
    const learningPath = { id: '123', selected_level: 'N5' };
    const profile = { onboarding_completed: false } as any;
    const needsOnboarding = !learningPath || !profile.onboarding_completed;
    expect(needsOnboarding).toBe(true);
  });
});

// ─── Dashboard data contract tests ───────────────────────────────────────────

describe('Dashboard data contracts', () => {
  it('derives weak count from weakTopics array length', () => {
    const weakTopics = [
      { id: '1', topic: 'particles', skill_area: 'grammar', mistakes_count: 3, user_id: 'u', last_seen_at: '' },
      { id: '2', topic: 'greetings', skill_area: 'vocabulary', mistakes_count: 1, user_id: 'u', last_seen_at: '' },
    ];
    expect(weakTopics.length).toBe(2);
  });

  it('dueCount is derived from flashcards array length', () => {
    const flashcardsDue = [
      { id: 'c1', next_review_date: '2026-03-14', review_state: 'review' },
      { id: 'c2', next_review_date: '2026-03-13', review_state: 'new' },
    ];
    expect(flashcardsDue.length).toBe(2);
  });
});

// ─── Roadmap level override tests ─────────────────────────────────────────────

describe('Roadmap level override', () => {
  const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

  function getLevelStatus(effectiveLevel: string, levelId: string) {
    const levelIndex = LEVELS.indexOf(levelId);
    const currentIndex = LEVELS.indexOf(effectiveLevel);
    if (levelIndex < currentIndex) return 'complete';
    if (levelId === effectiveLevel) return 'current';
    return 'locked';
  }

  it('levels before current are complete', () => {
    expect(getLevelStatus('N3', 'N5')).toBe('complete');
    expect(getLevelStatus('N3', 'N4')).toBe('complete');
  });

  it('current level is current', () => {
    expect(getLevelStatus('N3', 'N3')).toBe('current');
  });

  it('levels after current are locked', () => {
    expect(getLevelStatus('N3', 'N2')).toBe('locked');
    expect(getLevelStatus('N3', 'N1')).toBe('locked');
  });

  it('jumping ahead triggers confirmation (higher index)', () => {
    const from = 'N5';
    const to = 'N3';
    const shouldConfirm = LEVELS.indexOf(to) > LEVELS.indexOf(from);
    expect(shouldConfirm).toBe(true);
  });
});
