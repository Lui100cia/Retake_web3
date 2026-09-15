export type Choice = {
  id: string;
  label: string;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  createdAt: string;
  choices: Choice[];
};

export type PollsFile = {
  polls: Poll[];
};
