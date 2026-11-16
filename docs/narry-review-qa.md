# Narry voice, poses and conversation review QA

Verified 2026-11-16 against a production Vite build on a separate local QA origin. The existing localhost:5174 user tab and its data were left available.

## Narry

- Public VI/EN mascot copy uses Narry. TypeScript AST scan found zero standalone user-visible Buddy/BUDDY strings. Internal component names, storage keys and asset filenames stay compatible.
- Both transparent 1254 × 1254 atlases were inspected as nine aligned cells. Original blue Narry has different body poses, including seated reading, kneeling encouragement, thinking, attentive listening and a sheepish reaction. Option 5 keeps no arms or legs.
- Browser exercised greeting, listening hero, expanded thinking hint, wrong-answer oops and correct-answer celebration. Coach badge and atlas crop render separately; legacy tall home illustration slots now retain square atlas proportions.
- Original home and full report checked at 320, 768, 1024 and 1440 CSS px. No document/report horizontal overflow. Saved-report modal also checked at these widths.
- Blocking the new atlas request falls back to the original brand mascot rather than a broken image. Network/cache overrides were removed after testing.
- Reduced-motion emulation produced `animation-name: none` on mascot avatars. The override was reset. Mic states retain the existing motion suppression; no hardware microphone or camera permission was requested.
- Option 5 tutor still has an armless mascot at the desk and a separate labeled mic button beneath it. Blue desk phone artwork stays intact.

## Conversation review demo

- Finish opens Overview / Conversation / Level up, with focus moved to the report heading. Keep practising resumes the same draft. Save & finish records practice once; summary can reopen the report.
- All seven turns of the QA conversation were shown in order. Disabling example corrections reproduced every original message exactly. Two matched spans were shown with semantic del/ins; explanations expanded and unmatched turns explicitly remained unassessed.
- A separate four-turn sample transcript demonstrates corrections. Returning to Your conversation restores the actual three-turn Option 5 transcript; sample text does not enter saved data.
- Fixed B1 / 72 and component scores have a persistent demo disclosure. Pronunciation is unassessed. Neither CEFR nor mock scores update learning progress; profile level stayed B2.
- Level up provides prepared natural-phrasing examples, explanations and vocabulary tips. Saving “unwind” changed its action to Saved and added the phrase to Dictionary. Repeat saves are disabled and guarded in the state updater.
- Saved both original and Option 5 conversations. Profile archive retained both speakers after a full page reload; the latest 20 sessions are scoped through account storage. The summary counts words added during the current session.
- VI/EN copy checked, including singular “reply”. Dark mode checked; score text uses surface color against the theme accent to preserve contrast. Light mode and Vietnamese were restored on the QA profile.
- Console error capture was empty at the final report check. Browser read-aloud controls use TTS, not recordings of the learner. No real CEFR assessment, live AI correction or phonetic analysis is included, following the user's choice to build the UI demo first.

## Checks

- `npm run build`: passed. Existing Vite main-chunk size advisory remains.
- `node --test tools/qa/session-review.test.mjs tools/qa/accounts-family.test.mjs`: 11 passed. Covers exact correction spans, preserving unsupported text, bounded/validated transcript restore, removal of display scores from restored sessions and account-key isolation.
- `git diff --check`: passed.

CEFR criterion labels reference the [Council of Europe qualitative descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/table-3-cefr-3.3-common-reference-levels-qualitative-aspects-of-spoken-language-use). Display numbers are illustrative UI values with no official numeric-to-CEFR mapping.

Screenshots are under `docs/screenshots/narry-*.jpg`. Atlas prompts and provenance are recorded in `tools/narry-emotion-prompts.md` and `public/brand/narry-emotions-provenance.json`.
