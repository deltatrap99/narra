# Narra brand guidelines

This is the source of truth for Narra's Option 1 identity, supplied by the user on 15 November 2026. The supplied board is archived at `tools/brand-board-option1.png`. It supersedes the earlier purple interface styling.

## Quick reference

| Element | Specification |
| --- | --- |
| Brand | Narra |
| Wordmark | Exact lowercase supplied `narra` artwork; final a forms a speech bubble |
| Tagline | Your voice. Your story. |
| Primary Color | #9CE943 (Lime) |
| Secondary Color | #6DD9FF (Cyan) |
| Accent Color | #FF6E0B (Orange) |
| Base | #000000 (Black), clean white surfaces |
| Character | Young, modern, friendly, encouraging, expressive |

## Palette

The first four values were sampled from flat interiors of the large lower-right palette swatches in the supplied 2560 × 1440 board. The small upper-right GE palette is contextual reference and is not Narra's app palette.

### Primary Colors

| Token | Hex | RGB | Use |
| --- | --- | --- | --- |
| Black | #000000 | 0, 0, 0 | Brand anchor, wordmark, dark areas |
| Lime | #9CE943 | 156, 233, 67 | Primary action fills, active accents, progress |
| Cyan | #6DD9FF | 109, 217, 255 | Conversation, information, mascot environment |
| Orange | #FF6E0B | 255, 110, 11 | Streaks, recording, energy accents |

The supplied large wordmark has a brighter lime raster color, predominantly #9AF953. Keep the provided artwork's source color; do not recolor or redraw its glyph. Use #9CE943 for app UI fills.

### Neutral and implementation colors

These are implementation derivatives chosen for readable product UI; they are not additional swatches claimed from the board.

| Token | Hex | RGB | Use |
| --- | --- | --- | --- |
| Ink | #10140F | 16, 20, 15 | Main text |
| Muted | #657062 | 101, 112, 98 | Secondary text |
| Background | #F8FAF6 | 248, 250, 246 | Clean app canvas |
| Surface | #FFFFFF | 255, 255, 255 | Cards and dialogs |
| Border | #E3E8DF | 227, 232, 223 | Dividers and controls |
| Green ink | #32661A | 50, 102, 26 | Readable links and small active labels |
| Lime tint | #EEF9E3 | 238, 249, 227 | Light emphasis panels |
| Cyan tint | #EAF9FF | 234, 249, 255 | Conversation and practice panels |
| Orange tint | #FFF0E5 | 255, 240, 229 | Warm accents |

Use black or Ink text on lime, cyan, and orange fills. Do not use white text on lime. Use Green ink, rather than Lime, for small text on white. Preserve focus rings, text labels, and icons so meaning never depends on color alone.

## Logo

Use assets in `public/brand`:

| File | Intended use |
| --- | --- |
| logo-dark.webp | Black narr plus supplied lime speech-bubble a on white/light backgrounds |
| logo-light.webp | White narr plus supplied lime speech-bubble a on black/dark backgrounds |
| icon.webp, icon.png | Exact supplied speech-bubble a for compact brand mark and app icon |
| tagline.webp | Exact supplied cyan raster tagline, separately cropped |
| mascot.webp | Original brand-aligned generated 3D mascot |

The wordmark assets were extracted from the board's large central logo; antialiasing was converted from black backing to alpha. The light-to-dark text variant changes only the white narr to black and keeps glyph geometry and the source lime mark. No replacement typeface is used.

Preserve aspect ratio, all rounded terminals, the counter and pointed tail of the final a. Do not stretch, redraw, add strokes, rotate, or apply shadows to the logo. Recommended minimum digital widths: wordmark 120 px, icon 24 px. Give it uncluttered breathing room, ideally one mark-height outside the lockup; the compact app header may use its established padding.

The exact tagline is **Your voice. Your story.** including both periods. Keep it readable and separate from dense navigation.

## Typography

The board shows a rounded sans-serif direction but does not identify a font family. The original supplied wordmark remains artwork. The current product pairs local **Quicksand for display/headings** with **Nunito for body copy and controls**. This pairing implements the user's later request for a warmer, more playful app; it is not a claim about the original logo font or a copy of another app's type system.

### Font stack

| Role | Stack | Weight |
| --- | --- | --- |
| Heading/display | Quicksand, Nunito, sans-serif | 600–700 |
| Body/control | Nunito, sans-serif | 400–800; stronger action labels where needed |
| Mono | ui-monospace, SFMono-Regular, Consolas, monospace | 400 |

Fonts are served from `public/quicksand.ttf` and `public/nunito.ttf`; both OFL notices are bundled beside them. `src/refined.css` applies the current font roles. Quicksand's available variable range is 300–700, so the display direction should use its supported bold weight rather than depend on synthetic extra-bold lettering.

Maintain short headlines, readable line heights and a clear hierarchy. Body text should remain at least 14 px in compact controls and 16 px in extended reading. English learning words and examples stay English when app guidance is switched to Vietnamese.

## Imagery and components

Use clean light backgrounds, tactile 3D details, subtle glass navigation and tutor imagery where it serves selection. The Narra mascot is a fuzzy cyan-blue speech-bubble character with large white eyes, cobalt arms and legs, and a small cyan star tuft. It should feel encouraging and curious. The brief opening animation introduces Narry and the wordmark; provide Skip, reduced-motion behavior and replay through Settings.

Avoid reintroducing purple as an app theme. Source tutor photographs or reference images may contain incidental colors; use the new palette for their surrounding UI. Favor lime primary buttons with dark text, cyan conversation surfaces, orange streak accents, rounded white cards, and restrained shadows.

Keep controls recognizable at all sizes. Use consistent corner radii around controls, cards, sheets and pills. The newer motivational/avatar components use modest lower-edge shadows to suggest physical buttons; shadows must not obscure labels or become heavy decoration. Use a 4 px spacing grid. Focus outlines use Green ink with a clearly visible offset.

The personalized learner avatar is an original React SVG human character with selectable hair, skin, shirt and accessories. It is separate from Narra Narry and the reference tutor characters. Its changes are saved locally only when the learner presses Save; Cancel preserves the previous appearance.

### Themes

Settings exposes Light, Dark and System appearance. Light mode uses the established white/lime/cyan palette. Dark mode uses deep blue-green canvases and surfaces, light text and the same recognizable lime actions. Preserve contrast, selected states, borders and focus visibility in both themes. Validate secondary panels and native controls during device QA rather than assuming a token change covers every surface.

### Current product structure

The primary dock has four destinations: **Lesson, Practice, Dictionary, Profile**. Lesson emphasizes the next lesson; Practice emphasizes tutor speaking modes; Dictionary groups word review and related vocabulary exercises; Profile contains identity, goals, Study Plan, tutor, progress and Settings. The dock stays available outside a focused conversation session.

XP, daily quests and badges encourage small learning steps. Community screens use explicit demo labels for fictional leagues, profiles and feed posts. Follow/cheer preferences remain on the device. Never present fictional participants, seeded reference progress or sample scores as verified real-user outcomes.

The profile QR must encode the actual invitation URL rendered by the app. Copy and device sharing occur only after the learner presses the corresponding button. Do not imply that the QR publishes a synced public profile: profile data currently stays in this browser.

Plus and Family are plan previews. Keep proposed features labeled coming soon, pricing unannounced, and Narra Free as the current plan. Saving interest must not appear to activate a subscription or send a real notification. No billing or payment is taken.

## Voice

Write like a supportive conversation partner: short, clear, warm and specific. Encourage trying, make the next step easy and respect the learner's pace. Avoid inflated claims about fluency or scores. Browser speech capture and playback are functional where supported, but tutor replies and learning suggestions are sample scripts. Do not describe them as live AI or invent phoneme/CEFR scores from typing or speech-recognition confidence.

Examples:

- "Hôm nay, mình nói gì?"
- "Một chút luyện tập, thêm một chút tự tin."
- "Your voice. Your story."

Keep existing English lesson content when the learning task calls for English. Product messaging can use Vietnamese where appropriate.

## Tokens and synchronization

Run `node tools/sync-brand-tokens.mjs` after editing palette values in this document. It reads the table values above and writes both `assets/design-tokens.json` and `assets/design-tokens.css`. The JSON records primitive, semantic, and component roles. The script verifies key text contrast pairs.

The product owner applies these tokens to app source styles. Generated color artifacts should stay synchronized with this document. The token helper emits Quicksand heading and Nunito body roles in both generated artifacts; `src/refined.css` applies them throughout the interface.

## Provenance

- User-supplied Option 1 board: `tools/brand-board-option1.png`.
- Extraction helper: `tools/extract-brand-assets.py`.
- Logo source crop and metadata: `public/brand/asset-provenance.json`.
- Mascot: generated using the built-in image_gen tool, with the supplied board as a style reference. Prompt recorded in `tools/asset-prompts.md`.


## Mascot name and expression

The mascot is named **Narry**. Refer to the learner as “bạn” and let Narry use its name and “tớ” in friendly Vietnamese guidance. Current emotion atlases have nine different body poses and emotions, selected by actual UI state. See `tools/narry-emotion-prompts.md` and `public/brand/narry-emotions-provenance.json`. Blue Narry has arms and legs; Option 5 remains an armless caterpillar.
