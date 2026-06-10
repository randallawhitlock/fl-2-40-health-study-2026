export type Question = {
  module: string;
  group?: string;
  question: string;
  options: string[];
  answer: string;
  topic?: string;
  explanation?: string;
};
