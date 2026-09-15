import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Poll, PollsFile } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "polls.json");

/**
 * Toute écriture relit le fichier, le modifie en mémoire puis le réécrit
 * entièrement. Les écritures sont sérialisées pour qu'un vote simultané
 * n'écrase pas l'autre.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

async function readFileContent(): Promise<PollsFile> {
  const raw = await readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as PollsFile;
  return { polls: Array.isArray(parsed.polls) ? parsed.polls : [] };
}

async function writeFileContent(content: PollsFile): Promise<void> {
  await writeFile(DATA_FILE, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

/** Relit, applique `mutate`, réécrit. Une seule mutation à la fois. */
function mutate<T>(fn: (content: PollsFile) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const content = await readFileContent();
    const result = await fn(content);
    await writeFileContent(content);
    return result;
  });
  // La file continue même si une mutation échoue.
  writeQueue = run.catch(() => undefined);
  return run;
}

/** Sondages du plus récent au plus ancien. */
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

/**
 * Incrémente le compteur d'un choix. Le choix doit appartenir au sondage
 * visé (RG-03), sinon rien n'est écrit.
 */
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

/** Supprime le sondage et, avec lui, tous ses votes (RG-09). */
export async function removePoll(id: string): Promise<boolean> {
  return mutate((content) => {
    const index = content.polls.findIndex((poll) => poll.id === id);
    if (index === -1) return false;

    content.polls.splice(index, 1);
    return true;
  });
}

/** Total des votes d'un sondage. */
export function totalVotes(poll: Poll): number {
  return poll.choices.reduce((total, choice) => total + choice.votes, 0);
}
