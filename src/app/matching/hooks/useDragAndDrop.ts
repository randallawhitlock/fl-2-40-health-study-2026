import { useRef, useCallback, useState } from 'react';
import type { Term } from '../types';

interface UseDragAndDropOptions {
  matched: Set<number>;
  onMatch: (termId: number, defId: number) => void;
  defElemsRef: React.MutableRefObject<Map<number, HTMLDivElement>>;
}

/**
 * Custom hook encapsulating all drag-and-drop logic for both
 * HTML5 drag (desktop) and touch events (mobile).
 */
export function useDragAndDrop({ matched, onMatch, defElemsRef }: UseDragAndDropOptions) {
  const dragIdRef = useRef<number | null>(null);
  const touchIdRef = useRef<number | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const [activeDef, setActiveDef] = useState<number | null>(null);

  /* ── Ghost helpers ─────────────────────────── */
  const showGhost = useCallback((text: string, x: number, y: number) => {
    if (!ghostRef.current) return;
    ghostRef.current.textContent = text;
    ghostRef.current.style.display = 'block';
    ghostRef.current.style.left = `${x}px`;
    ghostRef.current.style.top = `${y - 50}px`;
  }, []);

  const hideGhost = useCallback(() => {
    if (ghostRef.current) ghostRef.current.style.display = 'none';
  }, []);

  /* ── Hit-test: which drop zone is under (x, y)? */
  const hitTestDef = useCallback((x: number, y: number): number | null => {
    for (const [id, el] of defElemsRef.current.entries()) {
      if (matched.has(id)) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return id;
    }
    return null;
  }, [matched, defElemsRef]);

  /* ── Attempt a match ───────────────────────── */
  const tryMatch = useCallback((termId: number, defId: number) => {
    onMatch(termId, defId);
    setActiveDef(null);
    dragIdRef.current = null;
  }, [onMatch]);

  /* ═══ HTML5 Drag handlers (desktop) ══════════ */
  const onDragStart = useCallback((e: React.DragEvent, id: number) => {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragEnd = useCallback(() => {
    dragIdRef.current = null;
    setActiveDef(null);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent, defId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!matched.has(defId)) setActiveDef(defId);
  }, [matched]);

  const onDragLeave = useCallback(() => {
    setActiveDef(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent, defId: number) => {
    e.preventDefault();
    if (dragIdRef.current === null) return;
    tryMatch(dragIdRef.current, defId);
  }, [tryMatch]);

  /* ═══ Touch handlers (mobile) ════════════════ */
  const onTouchStart = useCallback((e: React.TouchEvent, term: Term) => {
    if (matched.has(term.id)) return;
    dragIdRef.current = term.id;
    touchIdRef.current = e.changedTouches[0].identifier;
    const t = e.changedTouches[0];
    showGhost(term.text, t.clientX, t.clientY);
  }, [matched, showGhost]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
    if (!touch) return;
    e.preventDefault();
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX}px`;
      ghostRef.current.style.top = `${touch.clientY - 50}px`;
    }
    setActiveDef(hitTestDef(touch.clientX, touch.clientY));
  }, [hitTestDef]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
    hideGhost();
    if (!touch || dragIdRef.current === null) {
      dragIdRef.current = null;
      setActiveDef(null);
      return;
    }
    const overDef = hitTestDef(touch.clientX, touch.clientY);
    if (overDef !== null) {
      tryMatch(dragIdRef.current, overDef);
    } else {
      setActiveDef(null);
    }
    dragIdRef.current = null;
    touchIdRef.current = null;
  }, [hitTestDef, tryMatch, hideGhost]);

  return {
    activeDef,
    ghostRef,
    // HTML5 drag
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    // Touch
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
