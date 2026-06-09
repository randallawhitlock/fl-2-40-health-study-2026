export type Block =
  | { type: 'p'; text: string }
  | { type: 'tip'; text: string }
  | { type: 'list'; items: string[] };

export type Section = {
  heading: string;
  blocks: Block[];
};

export type Lesson = {
  module: string;
  title: string;
  sections: Section[];
};
