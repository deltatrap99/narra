# Narra

A responsive, interactive recreation of the supplied English-learning app screenshots and both walkthrough videos, updated to the supplied Narra Option 1 brand identity. Built with React, TypeScript, Vite and Lucide.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:5174. `npm run build` typechecks and creates a production build in `dist/`.

## Included

- Learn: daily goals, the 20 chapters / 60 lesson titles verified from video, list and winding graph views, locked progression, and a three-question sample lesson.
- Practice: category filters, full-screen chat / avatar views, local conversation drafts, Hint / Translate / Feedback / Save word / Level up, the four video tutors (Skye, Henry, Camila, Dwayne), custom topics, writing practice notes and listen-and-type shadowing.
- Words: seven starting reference words, three addable career words from video, collections, adding / deleting words, status and due filters, text-to-speech and flashcards. The Word workout has Recall, Listening and In context modes, deterministic typed answer checking, missed-word retry and saved progress.
- Say my words: word / sentence tabs, device-local recording and playback, saved attempt counts and an explicitly labeled example feedback panel matching the second video.
- Progress: recorded practice, a selectable 34-province Vietnam map, sample comparison figures, weekly chart, November 2026 calendar and activity log.
- Profile: saved name, level, learning goal, language, daily target and tutor preferences.

Profile, word lists and progress persist in browser localStorage. No accounts, analytics, external AI service or cloud database are connected. Conversation replies and lesson questions are explicitly labeled samples. Writing notes use local counts and simple feedback; recordings are not assigned artificial pronunciation scores. The 80 speaking score, 11 minutes and other starting values recreate the screenshot sample state.

The app is mobile-first with 20px side margins and the five-tab floating glass dock. Desktop uses the same visual system with responsive columns. The phone button on Learn also offers a compact app preview.

## Brand identity

The exact supplied wordmark / speech-bubble “a” glyph is extracted into `public/brand/`. The primary palette is black, lime `#9CE943`, orange `#FF6E0B` and cyan `#6DD9FF`; lime controls use black text and ordinary links use an accessible derived dark green. The blue fuzzy 3D mascot is recreated from the brand board. Tagline: “Your voice. Your story.”

Brand source of truth: `docs/brand-guidelines.md`. Token artifacts: `assets/design-tokens.json` and `assets/design-tokens.css`, imported into the app. Run `node tools/sync-brand-tokens.mjs` after editing the source brand documentation.

## Reference and asset notes

Visible reference text is preserved in `src/data.ts`; the supplemental videos supplied the complete chapter order, lesson names and tutor identities. Source Skye, Henry, Camila and Dwayne crops are in `public/assets/`. Skye’s shirt is rebranded Narra. The six original 3D illustrations / tutor portrait were initially recreated with built-in image generation because screenshot attachment paths were absent. Actual source illustration crops were subsequently extracted from video as `*-reference.webp`. All generation prompts are in `tools/asset-prompts.md`; the supplied brand board and sampled video frames are retained under `tools/` for source review.

The Nunito display font is supplied locally from the [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/nunito), licensed under OFL. Body text uses the system font. Province geometries come from [TaliaCao/Vietnam-Shape-Map](https://github.com/TaliaCao/Vietnam-Shape-Map), MIT licensed; its notice is bundled in `public/assets/vietnam-map-LICENSE.txt`. Map comparisons are clearly marked demo data.

## Verification

- Production TypeScript check and Vite build pass.
- All five tabs checked at 320, 768, 1024 and 1440px: no document-level horizontal overflow and no missing image assets.
- Browser journeys verified: word creation and persistence after reload, status filtering, deleting the test word, flashcard reveal / mastery, practice category filters, saving a writing practice, daily-goal update, lesson completion / unlock, province selection and ranking, calendar activity, and profile preference persistence.
- Additional video journeys verified: tutor selection, contextual café reply, conversation Hint / Use this reply / Translate / Feedback / Save word, avatar view, conversation finish; ten-word workout with a correct answer and missed words, result score, retry and cloze mode; word/sentence pronunciation tabs and labeled sample feedback.
- Microphone recording requires browser permission and compatible hardware. Its permission / disposal lifecycle was reviewed; real microphone input was not requested during browser QA.

Hosted as an owner-private Site. Deployment configuration is in `.openai/hosting.json`.
