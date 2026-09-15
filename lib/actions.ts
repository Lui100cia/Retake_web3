"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPoll, incrementVote, insertPoll, removePoll } from "./polls";
import type { Choice, Poll } from "./types";
import { validateChoices, validateQuestion } from "./validation";
import { hasVoted, markVoted } from "./voted";


export type ActionResult = { error: string } | null;


export async function createPoll(formData: FormData): Promise<ActionResult> {
  const rawQuestion = formData.get("question");
  const rawChoices = formData.getAll("choice");

  const questionError = validateQuestion(rawQuestion);
  if (questionError) {
    return { error: questionError };
  }

  const choicesError = validateChoices(rawChoices);
  if (choicesError) {
    return { error: choicesError };
  }

  const choices: Choice[] = rawChoices.map((value) => ({
    id: randomUUID(),
    label: String(value).trim(),
    votes: 0,
  }));

  const poll: Poll = {
    id: randomUUID(),
    question: String(rawQuestion).trim(),
    createdAt: new Date().toISOString(),
    choices,
  };

  try {
    await insertPoll(poll);
  } catch {
    return { error: "Le sondage n'a pas pu être enregistré. Réessayez." };
  }

  revalidatePath("/");
  redirect(`/polls/${poll.id}`);
}


export async function vote(pollId: string, choiceId: string): Promise<ActionResult> {
  if (typeof pollId !== "string" || typeof choiceId !== "string") {
    return { error: "Vote invalide." };
  }

  const poll = await getPoll(pollId);
  if (!poll) {
    return { error: "Ce sondage n'existe pas ou a été supprimé." };
  }

  if (await hasVoted(pollId)) {
    return { error: "Vous avez déjà voté pour ce sondage." };
  }

  if (!poll.choices.some((choice) => choice.id === choiceId)) {
    return { error: "Ce choix n'appartient pas à ce sondage." };
  }

  const result = await incrementVote(pollId, choiceId);
  if (result !== "ok") {
    return { error: "Le vote n'a pas pu être enregistré. Réessayez." };
  }

  await markVoted(pollId);

  revalidatePath("/");
  revalidatePath(`/polls/${pollId}`);
  return null;
}

export async function deletePoll(pollId: string): Promise<ActionResult> {
  if (typeof pollId !== "string") {
    return { error: "Suppression invalide." };
  }

  const removed = await removePoll(pollId);
  if (!removed) {
    return { error: "Ce sondage n'existe pas ou a déjà été supprimé." };
  }

  revalidatePath("/");
  return null;
}
