import { cookies } from "next/headers";

export const VOTED_COOKIE = "voted";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * RG-05 — le cookie httpOnly `voted` contient le tableau JSON des identifiants
 * de sondages déjà votés par ce navigateur.
 */
export async function readVotedPolls(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(VOTED_COOKIE)?.value;
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    // Cookie illisible : on repart d'une liste vide plutôt que de planter.
    return [];
  }
}

export async function hasVoted(pollId: string): Promise<boolean> {
  const voted = await readVotedPolls();
  return voted.includes(pollId);
}

/** Ajoute le sondage à la liste du cookie. Appelé depuis une server action. */
export async function markVoted(pollId: string): Promise<void> {
  const voted = await readVotedPolls();
  if (voted.includes(pollId)) return;

  const cookieStore = await cookies();
  cookieStore.set(VOTED_COOKIE, JSON.stringify([...voted, pollId]), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
  });
}
