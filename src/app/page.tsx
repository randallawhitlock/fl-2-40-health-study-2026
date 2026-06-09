'use client';

import Link from 'next/link';
import { PageShell, Card } from '@/components';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  label: string;
}

function FeatureCard({ title, description, href, label }: FeatureCardProps) {
  return (
    <Card>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link href={href} className="btn">{label}</Link>
    </Card>
  );
}

const features: FeatureCardProps[] = [
  {
    title: 'Flashcards',
    description: 'Master key terms and definitions with interactive cards.',
    href: '/flashcards',
    label: 'Start Studying',
  },
  {
    title: 'Practice Quizzes',
    description: 'Test your knowledge with module-specific assessments.',
    href: '/quiz',
    label: 'Take a Quiz',
  },
  {
    title: 'Lesson Summaries',
    description: 'Review detailed summaries of each module.',
    href: '/lessons',
    label: 'Read Lessons',
  },
  {
    title: 'Matching Game',
    description: 'Exercise your memory by matching terms to definitions.',
    href: '/matching',
    label: 'Play Game',
  },
];

export default function Home() {
  return (
    <PageShell title="FL Health & Life Study App" hideBack>
      <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '-1rem', marginBottom: '2rem' }}>
        Comprehensive study tools for the Florida 2-40 Health-Only License Exam
      </p>

      <div className="dashboard">
        {features.map(f => (
          <FeatureCard key={f.href} {...f} />
        ))}
      </div>

      <footer style={{ marginTop: '3rem', textAlign: 'center', color: '#055' }}>
        <p>&copy; {new Date().getFullYear()} Florida Health Insurance License Study App</p>
      </footer>
    </PageShell>
  );
}
