import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export function QuestionCard({
  index,
  total,
  questionText,
  options,
  selected,
  onSelect,
  revealed,
  correctOption,
  explanation,
  meta,
}: {
  index?: number;
  total?: number;
  questionText: string;
  options: string[];
  selected: number | null;
  onSelect: (value: number) => void;
  revealed: boolean;
  correctOption?: number | null;
  explanation?: string | null;
  meta?: string;
}) {
  const letters = ["A", "B", "C", "D", "E"];

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <p className="min-w-0 whitespace-pre-line text-[0.95rem] font-medium leading-7 text-foreground">
          {questionText}
        </p>
        {typeof index === "number" && typeof total === "number" ? (
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
            {index + 1}/{total}
          </span>
        ) : null}
      </div>
      {meta ? (
        <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{meta}</p>
      ) : null}

      <div className="mt-4 space-y-2">
        {options.map((option, i) => {
          const isCorrect = revealed && correctOption === i;
          const isWrongPick = revealed && selected === i && correctOption !== i;
          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => onSelect(i)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                "border-border bg-background hover:border-primary/40 hover:bg-secondary",
                selected === i && !revealed && "border-primary bg-primary-soft",
                isCorrect && "border-success bg-success-soft hover:bg-success-soft",
                isWrongPick && "border-destructive bg-destructive-soft hover:bg-destructive-soft",
                revealed && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-md border border-border text-xs font-semibold",
                  selected === i && !revealed && "border-primary bg-primary text-primary-foreground",
                  isCorrect && "border-success bg-success text-success-foreground",
                  isWrongPick && "border-destructive bg-destructive text-destructive-foreground",
                )}
              >
                {isCorrect ? (
                  <Check className="size-3.5" />
                ) : isWrongPick ? (
                  <X className="size-3.5" />
                ) : (
                  letters[i]
                )}
              </span>
              <span className="min-w-0 flex-1 leading-6">{option}</span>
            </button>
          );
        })}
      </div>

      {revealed && explanation ? (
        <div className="mt-4 rounded-lg border border-border bg-secondary p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Explanation
          </p>
          <p className="mt-1.5 text-sm leading-6 text-foreground">{explanation}</p>
        </div>
      ) : null}
    </div>
  );
}
