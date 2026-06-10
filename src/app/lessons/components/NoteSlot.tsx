'use client';

import { useState } from 'react';
import type { LessonNote } from '@/lib/storage-types';
import s from '../lessons.module.css';

interface NoteSlotProps {
  module: string;
  sectionIndex: number;
  blockIndex: number;
  notes: LessonNote[];
  onSave: (note: LessonNote) => void;
  onDelete: (id: string) => void;
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Renders between lesson blocks: a subtle "+ note" affordance,
 * plus any existing user notes anchored here (collapsed to an icon
 * until clicked).
 */
export function NoteSlot({
  module,
  sectionIndex,
  blockIndex,
  notes,
  onSave,
  onDelete,
}: NoteSlotProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const toggleOpen = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const saveNew = () => {
    const text = draft.trim();
    if (!text) return;
    onSave({
      id: newId(),
      module,
      sectionIndex,
      blockIndex,
      text,
      updatedAt: new Date().toISOString(),
    });
    setDraft('');
    setAdding(false);
  };

  const saveEdit = (note: LessonNote) => {
    const text = editDraft.trim();
    if (!text) return;
    onSave({ ...note, text });
    setEditingId(null);
  };

  return (
    <div className={s.noteSlot}>
      {notes.map(note =>
        editingId === note.id ? (
          <div key={note.id} className={s.noteEditor}>
            <textarea
              className={s.noteTextarea}
              value={editDraft}
              onChange={e => setEditDraft(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className={s.noteActions}>
              <button className={s.noteBtn} onClick={() => saveEdit(note)}>Save</button>
              <button className={s.noteBtnGhost} onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          </div>
        ) : openIds.has(note.id) ? (
          <div key={note.id} className={s.noteOpen}>
            <button
              className={s.noteBadge}
              onClick={() => toggleOpen(note.id)}
              title="Collapse note"
            >
              📝 Your note ▾
            </button>
            <p className={s.noteText}>{note.text}</p>
            <div className={s.noteActions}>
              <button
                className={s.noteBtnGhost}
                onClick={() => { setEditingId(note.id); setEditDraft(note.text); }}
              >
                Edit
              </button>
              <button
                className={s.noteBtnDanger}
                onClick={() => onDelete(note.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            key={note.id}
            className={s.noteBadge}
            onClick={() => toggleOpen(note.id)}
            title="Show your note"
          >
            📝 Your note ▸
          </button>
        )
      )}

      {adding ? (
        <div className={s.noteEditor}>
          <textarea
            className={s.noteTextarea}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Type your note…"
            rows={3}
            autoFocus
          />
          <div className={s.noteActions}>
            <button className={s.noteBtn} onClick={saveNew}>Save note</button>
            <button
              className={s.noteBtnGhost}
              onClick={() => { setAdding(false); setDraft(''); }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className={s.noteAdd}
          onClick={() => setAdding(true)}
          title="Add a note here"
        >
          ＋ Add note
        </button>
      )}
    </div>
  );
}
