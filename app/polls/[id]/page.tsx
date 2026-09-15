import Link from "next/link";
import { notFound } from "next/navigation";
import Results from "./results";
import VoteForm from "./vote-form";
import { getPoll } from "@/lib/polls";
import { hasVoted } from "@/lib/voted";

export const dynamic = "force-dynamic";

export default async function PollPage({ params }: PageProps<"/polls/[id]">) {
  const { id } = await params;
  const poll = await getPoll(id);

  if (!poll) {
    notFound();
  }

  const alreadyVoted = await hasVoted(poll.id);

  return (
    <section>
      <h1 className="text-2xl font-semibold">{poll.question}</h1>

      {alreadyVoted ? (
        <>
          <p className="mt-3 text-sm font-medium opacity-80">Vous avez déjà voté</p>
          <Results poll={poll} />
        </>
      ) : (
        <VoteForm pollId={poll.id} choices={poll.choices} />
      )}

      <p className="mt-8 text-sm">
        <Link href="/" className="underline">
          ← Retour à la liste
        </Link>
      </p>
    </section>
  );
}
