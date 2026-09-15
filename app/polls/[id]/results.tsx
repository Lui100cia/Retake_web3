import type { Poll } from "@/lib/types";
import { totalVotes } from "@/lib/polls";

export default function Results({ poll }: { poll: Poll }) {
  const total = totalVotes(poll);

  return (
    <div className="mt-6 flex flex-col gap-4">
      {poll.choices.map((choice) => {
        const percentage = total === 0 ? 0 : Math.round((choice.votes / total) * 100);

        return (
          <div key={choice.id} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium">{choice.label}</span>
              <span className="opacity-70">
                {choice.votes} vote{choice.votes > 1 ? "s" : ""} · {percentage} %
              </span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/15"
              role="img"
              aria-label={`${choice.label} : ${percentage} %`}
            >
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}

      <p className="text-sm opacity-70">
        Total : {total} vote{total > 1 ? "s" : ""}
      </p>
    </div>
  );
}
