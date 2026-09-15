"use client";

import { useState, useTransition } from "react";
import { createPoll } from "@/lib/actions";
import {
  CHOICES_MAX,
  CHOICES_MIN,
  QUESTION_MAX_LENGTH,
} from "@/lib/validation";


export default function NewPollForm() {
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateChoice(index: number, value: string) {
    setChoices((current) =>
      current.map((choice, position) => (position === index ? value : choice)),
    );
  }

  function addChoice() {
    setChoices((current) =>
      current.length < CHOICES_MAX ? [...current, ""] : current,
    );
  }

  function removeChoice(index: number) {
    setChoices((current) =>
      current.length > CHOICES_MIN
        ? current.filter((_, position) => position !== index)
        : current,
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("question", question);
    for (const choice of choices) {
      formData.append("choice", choice);
    }

    startTransition(async () => {
      // En cas de succès l'action redirige ; sinon elle renvoie un message.
      const result = await createPoll(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="question" className="text-sm font-medium">
          Question
        </label>
        <input
          id="question"
          name="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={QUESTION_MAX_LENGTH}
          placeholder="Quel framework pour le prochain projet ?"
          className="rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/20"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">
          Choix ({CHOICES_MIN} à {CHOICES_MAX})
        </legend>
        {choices.map((choice, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              name="choice"
              value={choice}
              onChange={(event) => updateChoice(index, event.target.value)}
              aria-label={`Choix ${index + 1}`}
              placeholder={`Choix ${index + 1}`}
              className="flex-1 rounded-md border border-black/20 bg-transparent px-3 py-2 dark:border-white/20"
            />
            <button
              type="button"
              onClick={() => removeChoice(index)}
              disabled={choices.length <= CHOICES_MIN}
              aria-label={`Retirer le choix ${index + 1}`}
              className="rounded-md border border-black/20 px-3 py-2 text-sm disabled:opacity-40 dark:border-white/20"
            >
              Retirer
            </button>
          </div>
        ))}
        <div>
          <button
            type="button"
            onClick={addChoice}
            disabled={choices.length >= CHOICES_MAX}
            className="mt-1 rounded-md border border-black/20 px-3 py-2 text-sm disabled:opacity-40 dark:border-white/20"
          >
            Ajouter un choix
          </button>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-foreground px-4 py-2 font-medium text-background hover:opacity-85 disabled:opacity-50"
          >
            {isPending ? "Création…" : "Créer le sondage"}
          </button>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
