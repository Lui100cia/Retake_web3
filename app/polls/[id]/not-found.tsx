import Link from "next/link";

export default function PollNotFound() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">Sondage introuvable</h1>
      <p className="mt-3 opacity-80">
        Ce sondage n&apos;existe pas ou a été supprimé.
      </p>
      <p className="mt-8 text-sm">
        <Link href="/" className="underline">
          ← Retour à la liste
        </Link>
      </p>
    </section>
  );
}
