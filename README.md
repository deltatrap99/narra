# Narra

A responsive English-learning app prototype built from the supplied screenshots, walkthrough videos, Narra brand board and UAT sheet. The current app uses four tabs—**Lesson, Practice, Dictionary and Profile**—with English/Vietnamese guidance, rounded Quicksand headings, Nunito body text and the Narra lime/cyan identity.

Built with React, TypeScript, Vite, Lucide and `qrcode`. Learning and community state is saved in this browser; this is not a connected account or live AI tutoring service.

## Run locally

```sh
npm install
npm run dev
```

Open [the local app](http://localhost:5174). `npm run build` runs TypeScript and creates the production build in `dist/`.

## Current experience

- **Lesson:** a prominent Start/Continue action, lesson preparation, a 20-unit/60-lesson list or winding path, sequential lesson locks, a compact daily goal/streak strip, daily quests and local XP. The first screen prioritizes the next lesson over statistics.
- **Practice:** Roleplay, Discussion, Debate and Interview scenarios, Free Talk, custom topics and the four reference tutors: Skye, Henry, Camila and Dwayne. Conversations have a prominent central mic, a transcript/audio view, automatic tutor speech when sound is enabled, hints, translations, concise language suggestions and word saving. A keyboard alternative is available for accessibility and unsupported speech recognition.
- **Dictionary:** distinct Start Review, Flashcards and Say My Words entries with explanations; saved-word search, collections, details, adding/deleting words and status/due filters; functional Word of the Day details; Shadowing, Pronunciation and Writing Check. The due-word workout has Recall, Listening and In context modes, deterministic answer checking and missed-word retry. Writing notes require at least 30 words.
- **Profile:** identity, editable custom avatar, daily target, Study Plan, current tutor and detailed practice history. The former Progress tab is available here, including the weekly chart, activity log, calendar and demo province map. Settings groups learning preferences, reminder/notification preferences, account information, app language and Light/Dark/System appearance.
- **Motivation and community previews:** local XP/levels and daily quests, achievements derived from local learning state, a demo league with fictional learners, sample friends to follow/unfollow, and a fictional feed with locally saved cheers. Local activity can also appear in your own feed section. These screens do not contact real learners or publish posts.
- **Personal touches:** a brief Buddy launch animation with Skip, reduced-motion support and replay from Settings; an avatar studio with hair, skin, shirt and accessory choices; and a genuine QR code for the profile-preview invitation URL, with copy and device-native sharing where supported.
- **A learning buddy:** contextual Buddy guidance helps choose a conversation, prepare an opener, try a review strategy, retry after feedback and choose the next step. Hints expand on request and English examples can be played aloud. The visible VI/EN control in the header switches guidance immediately and persists the choice. [Buddy voice notes](docs/buddy-voice.md) keep the tone friendly and practical.
- **Plan previews:** Narra Free remains the current plan. Plus/Family show proposed features and unannounced pricing. “Notify me” only saves plan interest on this device; it does not subscribe, email, charge or activate a paid plan.

The four-tab dock remains available on ordinary app pages and subpages. A conversation is a focused session. Dialogs use normal keyboard focus behavior and the launch screen can be skipped.

## What is real, local or simulated

Browser speech recognition captures English transcripts when the browser supports `SpeechRecognition`/`webkitSpeechRecognition`; text-to-speech uses installed browser voices. Microphone permission, speech-service availability and autoplay policies vary by device. A browser may use its vendor’s network service for recognition—this feature is not an offline or entirely on-device speech-processing guarantee.

Say My Words and Pronunciation can record and play back microphone audio with `MediaRecorder`. Recordings are temporary object URLs while that practice screen remains open. Attempt counts and progress are saved locally; audio is not uploaded by the app or retained as a cloud recording.

Tutor responses, hints, translations and language suggestions are deterministic samples. The app does not run a live language model, evaluate phonemes, or assign a pronunciation score from recognition confidence or typed text. Conversation detail can show observed turn duration and transcript-based words per minute; those are not pronunciation or proficiency scores. Writing Check reports counts and simple local practice notes, without an AI grade or estimated level.

Initial progress includes reference sample values such as 11 minutes and one conversation. These seeded values can affect the initial XP/achievement display; they are not measurements collected from a new learner. Fictional league users, feed posts and province comparison figures are labeled as demo content. A profile QR encodes a real invitation URL, but public profile identity, cross-device friend requests, authentication, cloud sync, social messaging, push notifications, scheduled reminders and payments are not connected.

## Storage

Validated `localStorage` records preserve learning preferences, words, progress, conversation drafts, avatar appearance, local social choices and plan interest. The intro’s once-per-session flag uses `sessionStorage`. Clearing browser storage resets this device’s state. There is no account database, analytics integration or cross-device synchronization.

## Visual system and assets

The supplied wordmark and speech-bubble “a” artwork live in `public/brand/`; the tagline is **Your voice. Your story.** The primary palette is lime `#9CE943`, cyan `#6DD9FF`, orange `#FF6E0B`, black and light surfaces. Lime controls use dark text, with a readable derived green for small accents. Dark appearance uses deep blue-green surfaces while retaining the same brand accents.

Quicksand is the display font; Nunito is the body/control font. Both are served locally, with their OFL notices in `public/quicksand-OFL.txt` and `public/nunito-OFL.txt`. The original wordmark remains artwork rather than a replacement typeface. Source and generated visual assets are documented in [brand guidelines](docs/brand-guidelines.md), `public/brand/asset-provenance.json` and `tools/asset-prompts.md`.

The chapter order, lesson names and tutor identities are recorded in `src/data.ts`. Reference assets and sampled walkthrough frames are retained under `tools/` and `public/assets/`. Province geometry comes from [TaliaCao/Vietnam-Shape-Map](https://github.com/TaliaCao/Vietnam-Shape-Map); its MIT notice is bundled in `public/assets/vietnam-map-LICENSE.txt`.

## Verification and remaining validation

The current integrated TypeScript check and Vite production build pass. Implementation coverage for source UAT rows 11–27 is tracked in [the UAT resolution notes](docs/uat-resolution.md); the source snapshot is `docs/uat-source.json`.

The final browser pass covered responsive layouts, intro/replay/skip, Vietnamese guidance, local quests/XP, social choices, avatar persistence, plan previews, QR generation/copy and light/dark contrast. See [the observed QA results](docs/qa-2026-11-16.md) and final screenshots under `tools/qa/`. This is not a stakeholder UAT sign-off. Real microphone recognition, audio quality, permission prompts, autoplay, physical QR scanning and native device sharing still require compatible hardware and browser verification. No real microphone test is claimed here.

The requested hosting target is Vercel. `vercel.json` selects Vite, `npm run build` and the `dist/` output. The repository production branch is intended to trigger Vercel builds. `.openai/hosting.json` retains the earlier workspace Site identity; that Site is not the requested publication target.
