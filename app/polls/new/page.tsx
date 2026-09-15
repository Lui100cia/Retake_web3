import Link from "next/link";
import NewPollForm from "./new-poll-form";

export const metadata = {
  title: "Nouveau sondage — Quick Poll",
};

export default function NewPollPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">Nouveau sondage</h1>
      <NewPollForm />
      <p className="mt-8 text-sm">
        <Link href="/" className="underline">
          ← Retour à la liste
        </Link>
      </p>
    </section>
  );
}
