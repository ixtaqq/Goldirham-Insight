import { Fragment, type ReactNode } from "react";

/** Inline parser: **bold** segments → <strong>. Content is trusted (our data). */
function inline(text: string): ReactNode[] {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-ink-950">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export function ArticleBody({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flush = () => {
    if (!list) return;
    const items = list.items;
    blocks.push(
      list.ordered ? (
        <ol key={key++} className="my-4 space-y-2 pl-1">
          {items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-muted">
              <span className="mt-0.5 font-mono text-sm font-semibold text-pine">
                {i + 1}.
              </span>
              <span>{inline(it)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul key={key++} className="my-4 space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-muted">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pine" />
              <span>{inline(it)}</span>
            </li>
          ))}
        </ul>
      )
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push(
        <h2
          key={key++}
          className="mt-8 text-lg font-semibold tracking-tight text-ink-950 first:mt-0"
        >
          {inline(line.slice(3))}
        </h2>
      );
      continue;
    }
    const ol = line.match(/^(\d+)\.\s+(.*)$/);
    if (ol) {
      if (!list || !list.ordered) {
        flush();
        list = { ordered: true, items: [] };
      }
      list.items.push(ol[2]);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!list || list.ordered) {
        flush();
        list = { ordered: false, items: [] };
      }
      list.items.push(line.slice(2));
      continue;
    }
    flush();
    blocks.push(
      <p key={key++} className="my-4 text-[15px] leading-relaxed text-muted">
        {inline(line)}
      </p>
    );
  }
  flush();

  return <div className="max-w-none">{blocks}</div>;
}
