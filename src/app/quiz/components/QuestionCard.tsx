import type { Question } from '../types';
import s from '../quiz.module.css';

interface QuestionCardProps {
  question: Question;
  userAnswer: string | null;
  onAnswer: (option: string) => void;
  onNext: () => void;
  isLast: boolean;
}

export function QuestionCard({
  question,
  userAnswer,
  onAnswer,
  onNext,
  isLast,
}: QuestionCardProps) {
  const isCorrect = userAnswer === question.answer;

  return (
    <div className={s.questionCard}>
      <p className={s.questionModule}>
        {question.module}
        {question.topic ? ` · ${question.topic}` : ''}
      </p>
      <h3 className={s.questionText}>{question.question}</h3>

      <ul className={s.optionsList}>
        {question.options.map((option, idx) => {
          let cls = s.optionItem;
          if (userAnswer === option) {
            cls += ` ${option === question.answer ? s.correct : s.incorrect}`;
          } else if (userAnswer !== null && option === question.answer) {
            cls += ` ${s.correct}`;
          }

          return (
            <li key={idx} className={cls} onClick={() => onAnswer(option)}>
              {option}
            </li>
          );
        })}
      </ul>

      {userAnswer && question.explanation && (
        <div className={`${s.explanationBox} ${isCorrect ? s.explanationCorrect : s.explanationIncorrect}`}>
          <strong>{isCorrect ? '✅ Correct. ' : '❌ Not quite. '}</strong>
          {question.explanation}
        </div>
      )}

      {userAnswer && (
        <div className={s.actions}>
          <button onClick={onNext} className="btn">
            {isLast ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}
