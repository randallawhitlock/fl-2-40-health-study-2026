'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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

/** Stamp activity time on a new state object (kept inside updaters). */
function touch(next: StudyData): StudyData {
    next.lastActivity = new Date().toISOString();
    return next;
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

    // Persist AFTER state commits. Updaters stay pure — writing inside a
    // state updater can run against a stale base state under concurrent
    // rendering and clobber saved data. The `loaded` gate guarantees we
    // never overwrite real data with defaults during initial mount.
    const skippedFirstWrite = useRef(false);
    useEffect(() => {
        if (!loaded) return;
        if (!skippedFirstWrite.current) {
            // First commit after hydration is just the data we read — skip it.
            skippedFirstWrite.current = true;
            return;
        }
        writeStorage(data);
    }, [data, loaded]);

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
                return touch({
                    ...prev,
                    groupStats,
                    quizHistory: [stored, ...prev.quizHistory].slice(0, MAX_QUIZ_HISTORY),
                });
            });
        },
        [],
    );

    // ── Flashcards ──────────────────────────────

    const markFlashcard = useCallback(
        (key: string, status: FlashcardStatus) => {
            setData(prev =>
                touch({
                    ...prev,
                    flashcardProgress: {
                        ...prev.flashcardProgress,
                        [key]: { status, dueAt: dueDateFor(status) },
                    },
                })
            );
        },
        [],
    );

    // ── Matching ────────────────────────────────

    const saveMatchingResult = useCallback(
        (timeMs: number) => {
            setData(prev => {
                const best = prev.matchingStats.bestTimeMs;
                return touch({
                    ...prev,
                    matchingStats: {
                        gamesPlayed: prev.matchingStats.gamesPlayed + 1,
                        bestTimeMs: best === null ? timeMs : Math.min(best, timeMs),
                        currentStreak: prev.matchingStats.currentStreak + 1,
                    },
                });
            });
        },
        [],
    );

    // ── Lessons ─────────────────────────────────

    const markLessonRead = useCallback(
        (module: string) => {
            setData(prev => {
                if (prev.lessonsRead.includes(module)) return prev;
                return touch({
                    ...prev,
                    lessonsRead: [...prev.lessonsRead, module],
                });
            });
        },
        [],
    );

    // ── Lesson notes ────────────────────────────

    /** Insert or update a note (matched by id). */
    const saveLessonNote = useCallback(
        (note: LessonNote) => {
            setData(prev => {
                const others = prev.lessonNotes.filter(n => n.id !== note.id);
                return touch({
                    ...prev,
                    lessonNotes: [...others, { ...note, updatedAt: new Date().toISOString() }],
                });
            });
        },
        [],
    );

    const deleteLessonNote = useCallback(
        (id: string) => {
            setData(prev =>
                touch({
                    ...prev,
                    lessonNotes: prev.lessonNotes.filter(n => n.id !== id),
                })
            );
        },
        [],
    );

    // ── In-progress activity state ──────────────

    const setActiveQuiz = useCallback(
        (state: ActiveQuizState | null) => {
            setData(prev => touch({ ...prev, activeQuiz: state }));
        },
        [],
    );

    const setActiveMatching = useCallback(
        (state: ActiveMatchingState | null) => {
            setData(prev => touch({ ...prev, activeMatching: state }));
        },
        [],
    );

    // ── Preferences ─────────────────────────────

    const updatePreferences = useCallback(
        (patch: Partial<UserPreferences>) => {
            setData(prev =>
                touch({
                    ...prev,
                    preferences: { ...prev.preferences, ...patch },
                })
            );
        },
        [],
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
