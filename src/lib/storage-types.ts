/** Persisted data structures for localStorage. */

// ── Quiz ────────────────────────────────────────

export type QuizMode = 'practice' | 'timed' | 'weak';

export interface MissedQuestion {
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    explanation?: string;
    topic?: string;
    module: string;
    group?: string;
}

export interface QuizAttempt {
    modules: string[];
    score: number;
    total: number;
    percentage: number;
    timestamp: string; // ISO 8601
    mode?: QuizMode;
    timeUsedMs?: number;
    missed?: MissedQuestion[];
}

/** Cumulative per-concept-group accuracy, keyed "module::group". */
export interface GroupStat {
    correct: number;
    total: number;
}

// ── Flashcards ──────────────────────────────────

/** Legacy statuses kept for migration; SRS ratings added. */
export type FlashcardStatus = 'known' | 'review' | 'again' | 'good' | 'easy';

export interface FlashcardEntry {
    status: FlashcardStatus;
    /** ISO timestamp when the card is due for review again. */
    dueAt: string;
}

// ── Matching ────────────────────────────────────

export interface MatchingStats {
    gamesPlayed: number;
    bestTimeMs: number | null;
    currentStreak: number;
}

// ── UI Preferences ──────────────────────────────

export interface UserPreferences {
    // Flashcards page
    flashcardModule: string;
    flashcardDefinitionFirst: boolean;
    flashcardShuffle: boolean;
    flashcardDueOnly: boolean;

    // Quiz page
    quizSelectedModules: string[];

    // Lessons page
    lessonsSelectedModule: string;

    // Matching page
    matchingModule: string;
}

// ── Root ────────────────────────────────────────

export interface StudyData {
    quizHistory: QuizAttempt[];
    /** Cumulative accuracy per concept group, keyed "module::group". */
    groupStats: Record<string, GroupStat>;
    /** SRS card state, keyed "module::term". */
    flashcardProgress: Record<string, FlashcardEntry>;
    matchingStats: MatchingStats;
    lessonsRead: string[];
    lastActivity: string; // ISO 8601
    preferences: UserPreferences;
}
