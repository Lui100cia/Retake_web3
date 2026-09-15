"use client";

import { useState, useTransition } from "react";
import { vote } from "@/lib/actions";
import type { Choice } from "@/lib/types";

type Props = {
  pollId: string;
  choices: Choice[];
};

/**
 * Formulaire de vote. Client pour garder le choix sélectionné et afficher
 * l'erreur renvoyée par l'action. Il n'envoie que deux identifiants : le
 * compteur est incrémenté côté serveur (RG-04).
 */
export default function VoteForm({ pollId, choices }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selected) {
      setError("Sélectionnez un choix avant de voter.");
      return;
    }

    startTransition(async () => {
      const result = await vote(pollId, selected);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Choix possibles</legend>
        {choices.map((choice) => (
          <label
            key={choice.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-black/10 px-4 py-3 hover:bg-black/[0.03] dark:border-white/15 dark:hover:bg-white/[0.04]"
          >
            <input
              type="radio"
              name="choiceId"
              value={choice.id}
              checked={selected === choice.id}
              onChange={() => setSelected(choice.id)}
            />
            <span>{choice.label}</span>
          </label>
        ))}
      </fieldset>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-foreground px-4 py-2 font-medium text-background hover:opacity-85 disabled:opacity-50"
        >
          {isPending ? "Envoi…" : "Voter"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </form>
  );
}
