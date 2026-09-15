"use client";

import { useState, useTransition } from "react";
import { deletePoll } from "@/lib/actions";

type Props = {
  pollId: string;
  question: string;
};


export default function DeletePollButton({ pollId, question }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `Supprimer le sondage « ${question} » ainsi que tous ses votes ?`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deletePoll(pollId);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md border border-red-600/40 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        {isPending ? "Suppression…" : "Supprimer"}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
