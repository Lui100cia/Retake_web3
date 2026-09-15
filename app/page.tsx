import Link from "next/link";
import DeletePollButton from "./delete-poll-button";
import { listPolls, totalVotes } from "@/lib/polls";

// Les données viennent d'un fichier : on relit à chaque requête.
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export default async function HomePage() {
  const polls = await listPolls();

  if (polls.length === 0) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">Sondages</h1>
        <p className="mt-6 rounded-lg border border-dashed border-black/20 p-8 text-center text-sm dark:border-white/20">
          Aucun sondage pour le moment.{" "}
          <Link href="/polls/new" className="font-medium underline">
            Créez le premier
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">Sondages</h1>
      <ul className="mt-6 flex flex-col gap-3">
        {polls.map((poll) => {
          const total = totalVotes(poll);
          return (
            <li
              key={poll.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/polls/${poll.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {poll.question}
                </Link>
                <p className="mt-1 text-sm opacity-70">
                  {poll.choices.length} choix · {total} vote{total > 1 ? "s" : ""} ·
                  créé le {dateFormatter.format(new Date(poll.createdAt))}
                </p>
              </div>
              <DeletePollButton pollId={poll.id} question={poll.question} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
