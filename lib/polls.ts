import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Poll, PollsFile } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "polls.json");


let writeQueue: Promise<unknown> = Promise.resolve();

async function readFileContent(): Promise<PollsFile> {
  const raw = await readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as PollsFile;
  return { polls: Array.isArray(parsed.polls) ? parsed.polls : [] };
}

async function writeFileContent(content: PollsFile): Promise<void> {
  await writeFile(DATA_FILE, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

function mutate<T>(fn: (content: PollsFile) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const content = await readFileContent();
    const result = await fn(content);
    await writeFileContent(content);
    return result;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

export async function listPolls(): Promise<Poll[]> {
  const { polls } = await readFileContent();
  return [...polls].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getPoll(id: string): Promise<Poll | null> {
  const { polls } = await readFileContent();
  return polls.find((poll) => poll.id === id) ?? null;
}

export async function insertPoll(poll: Poll): Promise<Poll> {
  return mutate((content) => {
    content.polls.push(poll);
    return poll;
  });
}

export type IncrementVoteResult = "ok" | "poll-not-found" | "choice-not-found";


export async function incrementVote(
  pollId: string,
  choiceId: string,
): Promise<IncrementVoteResult> {
  return mutate((content) => {
    const poll = content.polls.find((item) => item.id === pollId);
    if (!poll) return "poll-not-found";

    const choice = poll.choices.find((item) => item.id === choiceId);
    if (!choice) return "choice-not-found";

    choice.votes += 1;
    return "ok";
  });
}

export async function removePoll(id: string): Promise<boolean> {
  return mutate((content) => {
    const index = content.polls.findIndex((poll) => poll.id === id);
    if (index === -1) return false;

    content.polls.splice(index, 1);
    return true;
  });
}

export function totalVotes(poll: Poll): number {
  return poll.choices.reduce((total, choice) => total + choice.votes, 0);
}
