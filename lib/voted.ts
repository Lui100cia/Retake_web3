import { cookies } from "next/headers";

export const VOTED_COOKIE = "voted";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;


export async function readVotedPolls(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(VOTED_COOKIE)?.value;
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export async function hasVoted(pollId: string): Promise<boolean> {
  const voted = await readVotedPolls();
  return voted.includes(pollId);
}

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
