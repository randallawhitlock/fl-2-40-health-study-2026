/** Parse **bold** markers in text into <strong> React elements. */
export function renderInlineText(text: string) {
  const parts = text.split(/\*\*/);
  if (parts.length === 1) return text;
  return parts.map((part, idx) =>
    idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
  );
}
