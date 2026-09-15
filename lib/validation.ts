export const QUESTION_MIN_LENGTH = 5;
export const QUESTION_MAX_LENGTH = 120;
export const CHOICES_MIN = 2;
export const CHOICES_MAX = 5;

export type ValidationError = string;

export function validateQuestion(raw: unknown): ValidationError | null {
  if (typeof raw !== "string") {
    return "La question est obligatoire.";
  }

  const question = raw.trim();
  if (question.length < QUESTION_MIN_LENGTH || question.length > QUESTION_MAX_LENGTH) {
    return `La question doit contenir entre ${QUESTION_MIN_LENGTH} et ${QUESTION_MAX_LENGTH} caractères.`;
  }

  return null;
}

export function validateChoices(raw: unknown[]): ValidationError | null {
  if (raw.length < CHOICES_MIN || raw.length > CHOICES_MAX) {
    return `Un sondage doit avoir entre ${CHOICES_MIN} et ${CHOICES_MAX} choix.`;
  }

  const labels = raw.map((value) => (typeof value === "string" ? value.trim() : ""));

  if (labels.some((label) => label.length === 0)) {
    return "Chaque choix doit être renseigné.";
  }

  const seen = new Set<string>();
  for (const label of labels) {
    const key = label.toLocaleLowerCase();
    if (seen.has(key)) {
      return `Deux choix ne peuvent pas avoir le même libellé : « ${label} ».`;
    }
    seen.add(key);
  }

  return null;
}
