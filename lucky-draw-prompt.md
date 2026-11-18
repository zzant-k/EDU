# Lucky Draw — Apple-Style Desktop UI (Reproduction Prompt)

Use this prompt to recreate the exact same "Lucky Draw" desktop application UI, 100% identical to the reference build. It is written to be pasted into Lovable (TanStack Start + React 19 + Tailwind v4 + shadcn/ui + lucide-react) but is portable to any React project with those primitives.

---

## Role

Act as a **Senior Product Designer from the Apple Human Interface Design Team**. Ship a calm, premium **macOS desktop application** for randomly selecting winners at seminars, exhibitions and company events. Reference feel: **Apple HIG, Linear, Arc Browser, Notion, Raycast, Craft, CleanShot X, Superlist, Stripe Dashboard**.

Every element must feel intentional, pixel-perfect, hairline-precise, and human-designed — never AI-generic. No purple/indigo gradients on white. No generic hero. No emojis.

---

## Deliverable

A single page at route `/` rendering a fake macOS window containing the full Lucky Draw app. All state is local (no backend). Build with:

- TanStack Start route file at `src/routes/index.tsx`
- Tailwind v4 tokens declared in `src/styles.css`
- shadcn `Dialog` for the Winner modal
- `lucide-react` for icons
- No external images. Avatars are colored initials.

---

## Design Tokens (`src/styles.css`)

Light theme only. Add on top of the shadcn baseline.

```css
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display",
    "SF Pro Text", "Helvetica Neue", sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-hairline: var(--hairline);
  --shadow-window: 0 30px 60px -20px rgb(15 23 42 / 0.18),
    0 12px 24px -12px rgb(15 23 42 / 0.10);
  --shadow-card: 0 1px 2px rgb(15 23 42 / 0.04),
    0 1px 3px rgb(15 23 42 / 0.03);
  --shadow-elevated: 0 8px 24px -8px rgb(15 23 42 / 0.10),
    0 2px 6px rgb(15 23 42 / 0.04);
}

:root {
  --radius: 0.75rem;
  --background: oklch(0.977 0.003 247);   /* #F7F8FA */
  --foreground: oklch(0.207 0.043 265);   /* #0F172A */
  --surface: oklch(1 0 0);                /* #FFFFFF */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.207 0.043 265);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.207 0.043 265);
  --primary: oklch(0.546 0.221 262);      /* #2563EB */
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.968 0.005 247);
  --secondary-foreground: oklch(0.207 0.043 265);
  --muted: oklch(0.968 0.005 247);
  --muted-foreground: oklch(0.478 0.037 258); /* #475569 */
  --accent: oklch(0.968 0.005 247);
  --accent-foreground: oklch(0.207 0.043 265);
  --destructive: oklch(0.577 0.223 27);   /* #DC2626 */
  --destructive-foreground: oklch(1 0 0);
  --success: oklch(0.632 0.176 145);      /* #16A34A */
  --warning: oklch(0.687 0.163 62);       /* #D97706 */
  --border: oklch(0.918 0.008 255);       /* #E5E7EB */
  --hairline: oklch(0.94 0.006 255);
  --input: oklch(0.918 0.008 255);
  --ring: oklch(0.546 0.221 262);
}

@layer base {
  * { border-color: var(--color-border); }
  html, body {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "cv11", "ss01", "ss03";
    letter-spacing: -0.011em;
  }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
  }
}

@keyframes lucky-fade-scale {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes lucky-blur-in {
  from { opacity: 0; filter: blur(6px); }
  to { opacity: 1; filter: blur(0); }
}
@utility animate-lucky-in {
  animation: lucky-fade-scale 500ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
@utility animate-lucky-blur {
  animation: lucky-blur-in 300ms ease-out;
}
```

Also load Inter in `src/routes/__root.tsx` head via:

```html
<link rel="preconnect" href="https://rsms.me/" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
```

Head metadata:
- title: `Lucky Draw — Event Winner Selection`
- description: `A calm, premium desktop app for randomly selecting winners at seminars, exhibitions and company events.`

---

## Layout (macOS window)

Center a rounded window (`max-w-[1440px]`, `rounded-2xl`, `--shadow-window`) on a `bg-background` page (`p-6`).

1. **Title bar** (`h-11`, `border-b border-hairline`)
   - Left: three traffic-light dots (12px) — `#FF5F57`, `#FEBC2E`, `#28C840`.
   - Center: `Lucky Draw` in `text-[13px] font-medium text-muted-foreground`.

2. **Top nav bar** (`h-14`, `border-b border-hairline`, `bg-surface`, `px-5`)
   - Brand: 28px rounded-lg tile `bg-primary/10` with `Sparkles` icon in `--primary`; wordmark `Lucky Draw` `text-[14px] font-semibold`, right-divider hairline.
   - Nav pills (h-8, rounded-md, text-[13px]): Dashboard (active — `bg-secondary`), Participants, Winners, History, Settings. Icons from lucide: `LayoutGrid, UserRound, Trophy, History, Settings`.
   - Center chip: pill `bg-secondary/60` with green dot + `Design Week 2026 · Main Hall`.
   - Right: `Search`, `Bell` icon buttons + 28px avatar `JD` in blue-tinted swatch.

3. **Main grid** — three columns, fixed height `h-[760px]`:
   `grid-cols-[300px_1fr_320px]`.

### Left column — Participants (`bg-surface`, right hairline)
- Header row: `Participants` (`text-[13px] font-semibold`) + count on the right (`text-[12px] text-muted-foreground`).
- Search input `h-8 rounded-md border border-border`, `Search` icon leading, focus ring `ring-primary/25`.
- Scrollable list of rows (px-3, py-2, rounded-md, hover `bg-secondary/50`, selected `bg-secondary`):
  - 32px round avatar (colored initials), name (13px medium), org (12px muted, truncate).
  - Trailing indicator: `CheckCircle2` in success if already won; pulsing 6px blue dot when currently spinning; else empty `Circle` in border color.

### Center column — Draw Stage
Centered card `max-w-[520px] rounded-2xl bg-surface border p-10 --shadow-card`, flex column, centered:
- Eyebrow: `LUCKY DRAW` — `text-[11px] tracking-[0.14em] uppercase text-muted-foreground font-medium`.
- Sub: `Press Start to randomly select a winner.` `text-[13px] text-muted-foreground`.
- **Circular showcase**: three nested rings —
  - Outer 184px `rounded-full border border-hairline bg-background`.
  - Middle 160px empty (re-keyed on selected id, applies `animate-lucky-blur`).
  - Inner 144px `rounded-full` colored swatch containing the initials at `text-[44px] font-medium`.
- Name block (re-keyed): 20px semibold name, 13px muted org, 12px muted tabular ID.
- Status pill: `h-7 rounded-full bg-secondary/70 text-[12px]` with dot (warning + `animate-pulse` while drawing, else muted). Text: `Drawing…` / `Waiting`.
- Buttons row (two rows):
  - Row 1: primary `Start Draw` (h-10, rounded-lg, `bg-primary text-primary-foreground`, inset white 15%, blue shadow) + `Stop` (h-10, `bg-foreground text-background`). Icons `Play` / `Square`.
  - Row 2: secondary `Reset` (bordered) + ghost `Undo Winner`. Icons `RotateCcw` / `Undo2`.
- All action buttons: `active:scale-[0.98] transition-all`, disabled at `opacity-40/50`.

### Right column — Statistics + History (`bg-surface`, left hairline)
- **Statistics** section (`p-5 border-b border-hairline`):
  - Title `Statistics` (13px semibold) + `Round N` badge on right (`text-[11px] px-2 py-0.5 rounded bg-secondary/70`).
  - 2×2 grid of stat cells (`rounded-lg border border-hairline p-3`):
    - Total (`Users`), Eligible (`CheckCircle2`, success tone), Already Won (`Trophy`, warning tone), Remaining (`Clock`).
    - Cell body: 11px muted label with icon; 22px semibold tabular value.
- **Winner History** section (`p-5 flex-1 overflow-y-auto`):
  - Title `Winner History` + `View all ›` link (12px muted).
  - Vertical hairline timeline at `left-[15px]`.
  - Each item: 32px `rounded-full bg-surface border` with `Trophy` (warning for most recent, muted otherwise), name (13px medium), `org · time` (11px muted).
  - Empty state: `No winners yet.`
  - Below the list: "Most Recent" card — `rounded-xl border border-hairline p-4`, eyebrow `MOST RECENT` (10px, tracking-[0.14em] uppercase), 40px avatar + name + org.

---

## Winner Modal (shadcn Dialog)

`max-w-[420px] rounded-2xl border p-0`. Content padded `p-8`, centered, `animate-lucky-in`:
- Eyebrow: `WINNER` (`text-[10px] tracking-[0.16em] uppercase text-primary font-semibold`).
- 96px round avatar (initials).
- 22px semibold name, 13px muted org, 12px muted tabular ID.
- Copy: `Congratulations. Please come to the stage to claim your prize.` (13px muted, max-w-[280px]).
- Actions column:
  - Primary `Confirm Winner` (h-10, bg-primary).
  - Row of two: `Draw Again` (bordered) + `Close` (ghost).

---

## Data & State

- 15 mock participants (`PD-0142` through `PD-0156`), each `{ id, name, org, initials, tone, won? }`. Use varied hues via `bg-[oklch(0.9x_0.04_H)] text-[oklch(0.36_0.15_H)]` for hues `262, 150, 30, 300, 62, 200`. Mark two entries as `won: true` initially.
- Initial `winners`: two entries with times `10:24` and `10:12`.
- `selectedId` defaults to the first participant.
- `eligible = participants where !won && not in winners`.
- Search filters by name or org (case-insensitive).

### Drawing behavior (very important — feels Apple-like)

- **Start**: set `drawing=true`, run `setInterval(tick, 60)` that randomly picks a participant from the eligible pool (fallback to all) and updates `selectedId`. Each change re-triggers the 300ms `animate-lucky-blur` on the ring and the name block via React `key={selected.id}`.
- **Stop**: clear the interval, then perform a **manual easing tail** via `setTimeout` chain with delays `[140, 200, 280, 380, 520]` ms, each swapping to a new random pick. After the tail, pick a final winner and open the Winner modal 260 ms later.
- **Reset**: clear interval, drawing=false, selection back to first participant.
- **Undo Winner**: shift the newest winner out of history.
- **Confirm Winner**: prepend `{p, at: HH:MM}` to winners and close modal.
- **Draw Again** in modal: close modal, wait 200 ms, then start again.

Disable Start while drawing; Stop is only enabled while drawing; Undo disabled when history is empty.

---

## Motion

- Ring content and name block use `animate-lucky-blur` (300ms blur-in) re-keyed by selected id — creates the calm crossfade during shuffle.
- Winner modal enters with `animate-lucky-in` (500ms fade + scale from 0.98 with Apple cubic-bezier `0.22, 0.61, 0.36, 1`).
- Buttons: `active:scale-[0.98] transition-all`, primary uses subtle inset highlight + colored shadow.
- Status dot: `animate-pulse` when drawing.
- No confetti, no bounce, no springs. Restrained and premium.

---

## Typography

- Family: Inter with cv11/ss01/ss03 features enabled, `-0.011em` tracking on body.
- Sizes are literal (`text-[13px]`, `text-[22px]`, etc.) — resist rounding to Tailwind defaults.
- Tabular numerals on IDs and stat values.

---

## Iconography

`lucide-react`, `strokeWidth={2}` (2.25 for brand mark). Used icons: `Search, Bell, Sparkles, Play, Square, RotateCcw, Undo2, Trophy, Users, CheckCircle2, Circle, Clock, ChevronRight, Settings, LayoutGrid, UserRound, History`.

---

## Non-negotiables

- Semantic tokens only in components. No `bg-white`, `text-black`, or hard-coded hex except: traffic-light dots, avatar tone swatches (`oklch(...)` inline), and the primary button's inset/shadow.
- No purple/indigo hero, no gradient background, no glassmorphism, no marketing hero. This is a **desktop application shell** — the whole page is the app window.
- Hairlines (`border-hairline`) separate structural regions; regular `border` on cards and inputs.
- Every interactive element must have a resting, hover, active, and (where relevant) disabled state.
- No emojis anywhere.

---

## Acceptance checklist

- [ ] macOS window with traffic lights and centered title.
- [ ] Three-column layout at 300 / 1fr / 320.
- [ ] Participant list with avatars, search, and per-row status glyph.
- [ ] Draw stage with nested circular rings and re-keyed blur-in animation.
- [ ] Start / Stop / Reset / Undo controls with correct disabled states.
- [ ] Easing tail on Stop before winner modal opens.
- [ ] Statistics 2×2 grid with correct icons and tones.
- [ ] Timeline-style winner history with "Most Recent" card.
- [ ] Winner modal with WINNER eyebrow, 96px avatar, and three actions.
- [ ] Zero purple gradients, zero emojis, zero generic AI aesthetics.

Ship it as if it were a real macOS product going to the App Store.
