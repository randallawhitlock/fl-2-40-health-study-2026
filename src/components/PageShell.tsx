import Link from 'next/link';
import s from './shared.module.css';

interface PageShellProps {
  title: string;
  /** Hide the back link (e.g. on the dashboard itself) */
  hideBack?: boolean;
  children: React.ReactNode;
}

/**
 * Consistent page wrapper used by every route.
 * Provides max-width container, back link, and page title.
 */
export function PageShell({ title, hideBack, children }: PageShellProps) {
  return (
    <main className={s.pageShell}>
      <header className={s.header}>
        {!hideBack && (
          <Link href="/" className={s.backLink}>
            ← Back to Dashboard
          </Link>
        )}
        <h1 className={s.pageTitle}>{title}</h1>
      </header>
      {children}
    </main>
  );
}
