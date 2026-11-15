# Retro Digital Playground — designer portfolio

Next.js 15 · React 19 · TypeScript · Tailwind 4 · Three.js + React Three Fiber + Drei · Framer Motion.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## The experience

| Route | What it is |
|---|---|
| `/` | Boot screen (once per session, skippable, never for reduced-motion) → a low-poly PS2-style studio rendered at 240/360/480p with vertex wobble and 16-bit dithering. Click objects, or use the **Interact** menu / ↑↓ + Enter. Click the window for day/night. |
| `/about` | Character sheet: pixel avatar, traits, and tabs for Profile, Stats, Equipment (tools), Quest log (experience), Philosophy. |
| `/work` | Inventory of featured projects. Arrow keys move the selection; side panel previews. |
| `/work/[slug]` | Editorial case study on "paper", built from content blocks. |
| `/projects` | The no-game shortcut: every project, filterable, list or grid, hover previews. Linked from the HUD on every page. |
| `/playground` | Built-in toys (Dither Lab, Pixel Studio, Kern Catch) + your own media/link experiments. |
| `/contact` | Mail.exe form + direct links + "areas explored" progress. |

Keyboard everywhere: **1–6** jump to sections, **M** toggles sound (off by default). There's also a classic cheat code.

## Editing content — everything lives in `content/`

| File | What |
|---|---|
| `content/site.ts` | Name, role, tagline, about copy, stats, skills, tools, experience, contact email + links, résumé, optional avatar and room model |
| `content/projects.ts` | Projects. `featured: true` puts one in the Work inventory; all appear in `/projects` |
| `content/playground.ts` | Playground entries |

Anything in `[square brackets]` is placeholder copy. **The four projects shipped are templates (`sample: true`) — no work has been invented.** Replace them with real projects, or delete them.

### Adding a project
Put files in `public/assets/projects/<slug>/`, then add an entry:

```ts
{
  slug: "my-project",
  title: "My Project",
  category: "Brand Identity",
  year: "2025",
  description: "One or two sentences.",
  featured: true,
  rarity: "epic",              // inventory flavour: common | rare | epic | legendary
  thumbnail: { src: "/assets/projects/my-project/thumb.jpg", alt: "…", aspect: "4:3" },
  cover:     { src: "/assets/projects/my-project/cover.jpg", alt: "…", aspect: "16:9" },
  role: ["Lead designer"], tools: ["Figma"],
  blocks: [ /* see below */ ],
}
```

Block types (mix in any order): `text`, `media` (image or video, `wide` option), `gallery` (2–4 columns), `split` (text + image), `palette`, `typography`, `quote`, `stats`, `list`, `embed` (Vimeo/YouTube/Figma iframe). `sample-case-study` in `projects.ts` uses all of them — overview, problem, research, concept, moodboards, wireframes, type, colour, design system, final screens, mockups, motion and outcome.

Any media without a `src` renders as a labelled empty slot at the right ratio, so layouts can be reviewed before assets arrive. Videos (`kind: "video"`) autoplay muted unless the visitor prefers reduced motion. Pixel art: add `pixelated: true`.

### Your own 3D room
Set `roomModel: "/assets/models/room.glb"` in `site.ts`. Name objects (or empties) in Blender `hotspot_about`, `hotspot_work`, `hotspot_projects`, `hotspot_playground`, `hotspot_contact` — they become clickable, get markers, and their children count as part of the hotspot. Materials get the same retro treatment automatically. Camera framings for focus live in `components/room/hotspots.ts`.

### Avatar, fonts, colours
- Avatar: set `avatar` in `site.ts` to an image, or edit the 16×22 sprite in `lib/avatarSprite.ts`.
- Fonts: `app/layout.tsx` (switch to `next/font/local` for supplied files in `public/assets/fonts`).
- Colours: tokens at the top of `app/globals.css`.

## Contact form
Copy `.env.example` to `.env.local` and set `RESEND_API_KEY` + `CONTACT_TO_EMAIL` to send through [Resend](https://resend.com). Without them the form still works: it opens the visitor's mail app with the message filled in. Set the real address in `site.contact.email` either way.

## Performance & accessibility notes
- Three.js loads only on `/` and only after the page is interactive; the room renders at a fixed low internal resolution, so it's cheap on any screen.
- No WebGL → a fallback panel; the Interact menu always works without the 3D.
- Mobile: same room, simplified framing, tap once to look and twice to enter, plus the full menu below.
- Reduced motion: no boot, no camera moves, no idle animation, no page wipes.
- Sound is synthesized (no audio files) and off until the visitor turns it on.
- `NEXT_DIST_DIR=.next-build npm run build` builds into a separate folder so it can run alongside `npm run dev`.
