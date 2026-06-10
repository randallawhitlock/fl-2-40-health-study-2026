'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
    StudyData,
    QuizAttempt,
    GroupStat,
    FlashcardStatus,
    FlashcardEntry,
    MatchingStats,
    UserPreferences,
    ActiveQuizState,
    ActiveMatchingState,
    LessonNote,
} from './storage-types';

const STORAGE_KEY = 'fl-health-study';
const MAX_QUIZ_HISTORY = 50;
const MAX_STORED_MISSES = 40;

const DEFAULT_PREFERENCES: UserPreferences = {
    flashcardModule: 'All',
    flashcardDefinitionFirst: false,
    flashcardShuffle: false,
    flashcardDueOnly: false,
    flashcardIndex: 0,
    quizSelectedModules: [],
    lessonsSelectedModule: '',
    lessonsScrollY: 0,
    matchingModule: 'All',
};

const DEFAULT_MATCHING: MatchingStats = {
    gamesPlayed: 0,
    bestTimeMs: null,
    currentStreak: 0,
};

/** SRS intervals per rating, in hours. */
const SRS_INTERVALS: Record<FlashcardStatus, number> = {
    again: 0,        // due immediately
    review: 0,       // legacy "needs review" → due now
    good: 24 * 3,    // 3 days
    known: 24 * 7,   // legacy "known" → 7 days
    easy: 24 * 7,    // 7 days
};

export function dueDateFor(status: FlashcardStatus): string {
    const ms = SRS_INTERVALS[status] * 3600 * 1000;
    return new Date(Date.now() + ms).toISOString();
}

function createDefaultData(): StudyData {
    return {
        quizHistory: [],
        groupStats: {},
        flashcardProgress: {},
        matchingStats: { ...DEFAULT_MATCHING },
        lessonsRead: [],
        lessonNotes: [],
        lastActivity: new Date().toISOString(),
        preferences: { ...DEFAULT_PREFERENCES },
        activeQuiz: null,
        activeMatching: null,
    };
}

/** Migrate legacy flashcard values ("known" | "review" strings) to SRS entries. */
function migrateFlashcards(
    raw: Record<string, unknown> | undefined,
): Record<string, FlashcardEntry> {
    if (!raw) return {};
    const out: Record<string, FlashcardEntry> = {};
    for (const [key, val] of Object.entries(raw)) {
        if (typeof val === 'string') {
            // legacy format
            const status = (val === 'known' ? 'known' : 'review') as FlashcardStatus;
            out[key] = { status, dueAt: dueDateFor(status) };
        } else if (val && typeof val === 'object' && 'status' in val) {
            out[key] = val as FlashcardEntry;
        }
    }
    return out;
}

/** Read raw data from localStorage (SSR-safe). */
function readStorage(): StudyData {
    if (typeof window === 'undefined') return createDefaultData();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return createDefaultData();
        const parsed = JSON.parse(raw) as Partial<StudyData> & {
            flashcardProgress?: Record<string, unknown>;
        };
        // Merge with defaults so newly-added fields are always present
        return {
            ...createDefaultData(),
            ...parsed,
            groupStats: parsed.groupStats ?? {},
            flashcardProgress: migrateFlashcards(parsed.flashcardProgress),
            matchingStats: { ...DEFAULT_MATCHING, ...parsed.matchingStats },
            preferences: { ...DEFAULT_PREFERENCES, ...parsed.preferences },
            activeQuiz: parsed.activeQuiz ?? null,
            activeMatching: parsed.activeMatching ?? null,
            lessonNotes: parsed.lessonNotes ?? [],
        };
    } catch {
        return createDefaultData();
    }
}

/** Write data to localStorage (SSR-safe). */
function writeStorage(data: StudyData): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // Quota exceeded or private browsing — silently fail
    }
}

// ─────────────────────────────────────────────────

export function useStudyStorage() {
    const [data, setData] = useState<StudyData>(createDefaultData);
    /** True once data has actually been read from localStorage. */
    const [loaded, setLoaded] = useState(false);

    // Hydrate from localStorage after mount (avoids SSR mismatch)
    useEffect(() => {
        setData(readStorage());
        setLoaded(true);
    }, []);

    const persist = useCallback((next: StudyData) => {
        next.lastActivity = new Date().toISOString();
        setData(next);
        writeStorage(next);
    }, []);

    // ── Quiz ────────────────────────────────────

    /**
     * Save a finished quiz. `groupResults` updates cumulative per-concept
     * accuracy, keyed "module::group".
     */
    const saveQuizResult = useCallback(
        (
            attempt: Omit<QuizAttempt, 'timestamp'>,
            groupResults?: Record<string, GroupStat>,
        ) => {
            setData(prev => {
                const groupStats = { ...prev.groupStats };
                if (groupResults) {
                    for (const [key, r] of Object.entries(groupResults)) {
                        const cur = groupStats[key] ?? { correct: 0, total: 0 };
                        groupStats[key] = {
                            correct: cur.correct + r.correct,
                            total: cur.total + r.total,
                        };
                    }
                }
                const stored: QuizAttempt = {
                    ...attempt,
                    missed: attempt.missed?.slice(0, MAX_STORED_MISSES),
                    timestamp: new Date().toISOString(),
                };
                const next: StudyData = {
                    ...prev,
                    groupStats,
                    quizHistory: [stored, ...prev.quizHistory].slice(0, MAX_QUIZ_HISTORY),
                };
                persist(next);
                return next;
            });
        },
        [persist],
    );

    // ── Flashcards ──────────────────────────────

    const markFlashcard = useCallback(
        (key: string, status: FlashcardStatus) => {
            setData(prev => {
                const next: StudyData = {
                    ...prev,
                    flashcardProgress: {
                        ...prev.flashcardProgress,
                        [key]: { status, dueAt: dueDateFor(status) },
                    },
                };
                persist(next);
                return next;
            });
        },
        [persist],
    );

    // ── Matching ────────────────────────────────

    const saveMatchingResult = useCallback(
        (timeMs: number) => {
            setData(prev => {
                const best = prev.matchingStats.bestTimeMs;
                const next: StudyData = {
                    ...prev,
                    matchingStats: {
                        gamesPlayed: prev.matchingStats.gamesPlayed + 1,
                        bestTimeMs: best === null ? timeMs : Math.min(best, timeMs),
                        currentStreak: prev.matchingStats.currentStreak + 1,
                    },
                };
                persist(next);
                return next;
            });
        },
        [persist],
    );

    // ── Lessons ─────────────────────────────────

    const markLessonRead = useCallback(
        (module: string) => {
            setData(prev => {
                if (prev.lessonsRead.includes(module)) return prev;
                const next: StudyData = {
                    ...prev,
                    lessonsRead: [...prev.lessonsRead, module],
                };
                persist(next);
                return next;
            });
        },
        [persist],
    );

    // ── Lesson notes ────────────────────────────

    /** Insert or update a note (matched by id). */
    const saveLessonNote = useCallback(
        (note: LessonNote) => {
            setData(prev => {
                const others = prev.lessonNotes.filter(n => n.id !== note.id);
                const next: StudyData = {
                    ...prev,
                    lessonNotes: [...others, { ...note, updatedAt: new Date().toISOString() }],
                };
                persist(next);
                return next;
            });
        },
        [persist],
    );

    const deleteLessonNote = useCallback(
        (id: string) => {
            setData(prev => {
                const next: StudyData = {
                    ...prev,
                    lessonNotes: prev.lessonNotes.filter(n => n.id !== id),
                };
                persist(next);
                return next;
            });
        },
        [persist],
    );

    // ── In-progress activity state ──────────────

    const setActiveQuiz = useCallback(
        (state: ActiveQuizState | null) => {
            setData(prev => {
                const next: StudyData = { ...prev, activeQuiz: state };
                persist(next);
                return next;
            });
        },
        [persist],
    );

    const setActiveMatching = useCallback(
        (state: ActiveMatchingState | null) => {
            setData(prev => {
                const next: StudyData = { ...prev, activeMatching: state };
                persist(next);
                return next;
            });
        },
        [persist],
    );

    // ── Preferences ─────────────────────────────

    const updatePreferences = useCallback(
        (patch: Partial<UserPreferences>) => {
            setData(prev => {
                const next: StudyData = {
                    ...prev,
                    preferences: { ...prev.preferences, ...patch },
                };
                persist(next);
                return next;
            });
        },
        [persist],
    );

    // ── Clear ───────────────────────────────────

    const clearAll = useCallback(() => {
        const fresh = createDefaultData();
        setData(fresh);
        writeStorage(fresh);
    }, []);

    return {
        data,
        loaded,
        saveQuizResult,
        markFlashcard,
        saveMatchingResult,
        markLessonRead,
        saveLessonNote,
        deleteLessonNote,
        updatePreferences,
        setActiveQuiz,
        setActiveMatching,
        clearAll,
    } as const;
}
