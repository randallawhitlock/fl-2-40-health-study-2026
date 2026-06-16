export type ScenarioStep = {
  /** What the customer/member says. */
  customer: string;
  /** Prompt shown to the learner above the answer choices. */
  prompt: string;
  options: string[];
  answer: string;
  topic: string;
  explanation: string;
};

export type Scenario = {
  id: string;
  title: string;
  category: string;
  persona: string;
  context: string;
  steps: ScenarioStep[];
};
