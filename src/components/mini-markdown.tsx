import { type ReactNode } from "react";

/**
 * Minimal markdown renderer for AI lesson output: paragraphs, bullet/numbered
 * lists, **bold**, *italic* and `code`. Intentionally tiny — no HTML is injected.
 */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("`"))
      nodes.push(
        <code key={key} className="rounded bg-muted px-1 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      );
    else nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function MiniMarkdown({ text, className }: { text: string; className?: string }) {
  const lines = (text ?? "").split("\n");
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const key = `list-${blocks.length}`;
    const items = list.items.map((item, idx) => (
      <li key={`${key}-${idx}`}>{inline(item, `${key}-${idx}`)}</li>
    ));
    blocks.push(
      list.ordered ? (
        <ol key={key} className="list-decimal space-y-1 pl-5">
          {items}
        </ol>
      ) : (
        <ul key={key} className="list-disc space-y-1 pl-5">
          {items}
        </ul>
      ),
    );
    list = null;
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) {
      flush();
      return;
    }
    const ordered = /^\d+[.)]\s+/.exec(line);
    const bullet = /^[-*•]\s+/.exec(line);
    if (ordered || bullet) {
      const isOrdered = Boolean(ordered);
      if (!list || list.ordered !== isOrdered) {
        flush();
        list = { ordered: isOrdered, items: [] };
      }
      list.items.push(line.replace(/^(\d+[.)]|[-*•])\s+/, ""));
      return;
    }
    flush();
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push(
        <h3 key={`h-${index}`} className="mt-4 text-lg text-foreground">
          {inline(heading[2], `h-${index}`)}
        </h3>,
      );
      return;
    }
    blocks.push(
      <p key={`p-${index}`} className="text-[0.95rem] leading-7 text-foreground/90">
        {inline(line, `p-${index}`)}
      </p>
    );
  });
  flush();

  return <div className={className ? `prose-lesson ${className}` : "prose-lesson"}>{blocks}</div>;
}
