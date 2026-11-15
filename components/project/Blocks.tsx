import type { Block } from "@/content/types";
import { MediaFrame, aspectToCss } from "@/components/ui/MediaFrame";

const paras = (b: string | string[]) => (Array.isArray(b) ? b : [b]);

function Label({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mb-4 flex items-center gap-3 font-pixel text-[10px] uppercase tracking-[0.2em] text-print-dim">
      <span className="inline-block h-2 w-2 bg-print" />
      {children}
    </p>
  );
}

function Heading({ children }: { children?: string }) {
  if (!children) return null;
  return <h2 className="mb-5 font-serif text-4xl leading-[1.05] text-print md:text-5xl">{children}</h2>;
}

function Body({ body }: { body: string | string[] }) {
  return (
    <div className="space-y-4 text-[17px] leading-[1.7] text-print/85">
      {paras(body).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/** Renders one content block. Text sits in a readable column; media goes wide. */
export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return (
        <section className="mx-auto grid max-w-6xl gap-x-12 px-5 md:grid-cols-[14rem_minmax(0,1fr)] md:px-8">
          <div className="md:pt-3">
            <Label>{block.label}</Label>
          </div>
          <div className="max-w-2xl">
            <Heading>{block.heading}</Heading>
            <Body body={block.body} />
          </div>
        </section>
      );

    case "media":
      return (
        <section className={`mx-auto px-5 md:px-8 ${block.wide ? "max-w-[1400px]" : "max-w-6xl"}`}>
          <Label>{block.label}</Label>
          <MediaFrame media={block.media} tone="paper" sizes={block.wide ? "100vw" : "(min-width:1152px) 1152px, 100vw"} />
        </section>
      );

    case "gallery": {
      const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[block.columns ?? 3];
      return (
        <section className="mx-auto max-w-6xl px-5 md:px-8">
          <Label>{block.label}</Label>
          <Heading>{block.heading}</Heading>
          <div className={`grid gap-4 ${cols}`}>
            {block.items.map((m, i) => (
              <MediaFrame key={i} media={m} tone="paper" sizes="(min-width:768px) 33vw, 100vw" />
            ))}
          </div>
        </section>
      );
    }

    case "split":
      return (
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2 md:px-8">
          <div className={block.flip ? "md:order-2" : ""}>
            <Label>{block.label}</Label>
            <Heading>{block.heading}</Heading>
            <Body body={block.body} />
          </div>
          <MediaFrame media={block.media} tone="paper" sizes="(min-width:768px) 50vw, 100vw" />
        </section>
      );

    case "palette":
      return (
        <section className="mx-auto max-w-6xl px-5 md:px-8">
          <Label>{block.label}</Label>
          <Heading>{block.heading}</Heading>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {block.colors.map((c) => (
              <div key={c.hex + c.name} className="border-2 border-print bg-paper">
                <div className="aspect-[4/3]" style={{ background: c.hex }} />
                <div className="flex items-baseline justify-between gap-2 border-t-2 border-print px-3 py-2">
                  <span className="text-sm font-medium text-print">{c.name}</span>
                  <span className="font-term text-lg uppercase text-print-dim">{c.hex}</span>
                </div>
                {c.note && <p className="px-3 pb-2 text-xs text-print-dim">{c.note}</p>}
              </div>
            ))}
          </div>
        </section>
      );

    case "typography":
      return (
        <section className="mx-auto max-w-6xl px-5 md:px-8">
          <Label>{block.label}</Label>
          <Heading>{block.heading}</Heading>
          <div className="divide-y-2 divide-print border-y-2 border-print">
            {block.faces.map((f) => (
              <div key={f.name} className="grid gap-4 py-6 md:grid-cols-[14rem_minmax(0,1fr)]">
                <div>
                  <p className="font-medium text-print">{f.name}</p>
                  <p className="font-term text-lg text-print-dim">{f.role}</p>
                </div>
                <p className="break-words text-4xl leading-tight text-print md:text-6xl" style={{ fontFamily: f.family, fontWeight: f.weight }}>
                  {f.sample ?? "Aa Bb Cc 0123"}
                </p>
              </div>
            ))}
          </div>
        </section>
      );

    case "quote":
      return (
        <section className="mx-auto max-w-4xl px-5 text-center md:px-8">
          <blockquote className="font-serif text-3xl italic leading-snug text-print md:text-5xl">“{block.text}”</blockquote>
          {block.by && <p className="mt-5 font-pixel text-[10px] uppercase tracking-widest text-print-dim">— {block.by}</p>}
        </section>
      );

    case "stats":
      return (
        <section className="mx-auto max-w-6xl px-5 md:px-8">
          <Label>{block.label}</Label>
          <Heading>{block.heading}</Heading>
          <dl className="grid grid-cols-2 gap-px bg-print md:grid-cols-4">
            {block.items.map((s) => (
              <div key={s.label} className="bg-paper p-5">
                <dt className="font-term text-lg text-print-dim">{s.label}</dt>
                <dd className="mt-1 font-serif text-5xl text-print">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      );

    case "list":
      return (
        <section className="mx-auto grid max-w-6xl gap-x-12 px-5 md:grid-cols-[14rem_minmax(0,1fr)] md:px-8">
          <div className="md:pt-3">
            <Label>{block.label}</Label>
          </div>
          <div>
            <Heading>{block.heading}</Heading>
            <ul className="flex flex-wrap gap-2">
              {block.items.map((it) => (
                <li key={it} className="border-2 border-print px-3 py-1.5 text-sm text-print">
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "embed":
      return (
        <section className="mx-auto max-w-6xl px-5 md:px-8">
          <Label>{block.label}</Label>
          <div className="relative w-full border-2 border-print" style={{ aspectRatio: aspectToCss(block.aspect) }}>
            <iframe src={block.url} title={block.title} className="absolute inset-0 h-full w-full" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          </div>
        </section>
      );
  }
}
