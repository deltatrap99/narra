# Buddy at the right moment

Buddy's expression follows a real screen state. It offers company and a useful next step; it does not grade a learner's voice, award points, invent progress or react to a fictional participant as though they were present.

| Touchpoint | State | Mood |
| --- | --- | --- |
| Main guidance | A welcome, first step or invitation | `welcome` |
| Learning roadmap | Travelling to a selected stop | Option 5 crawl; original blue Buddy hop/glide |
| Learning roadmap | Arriving at an open / completed / locked stop | `welcome` / `celebrate` / `curious`; selecting never starts a lesson or changes progress |
| Lesson / Practice / Dictionary guidance | Choosing an opener, reviewing a strategy or exploring a word | `curious` or `focus`, with existing BuddyCoach guidance |
| Word workout feedback | Answer matches the normalized target | `celebrate` |
| Word workout feedback | Answer does not match, or the learner asks to reveal it | `encourage` |
| Word workout completion | Every target recalled correctly | `celebrate` |
| Word workout completion | Round finished with words to revisit | `proud` for finishing the round, with a clear retry action |
| Empty workout / flashcard deck | No eligible words | `encourage`, with a route back to Dictionary |
| Flashcard completion | The learner rated every card in the selected deck | `proud`; the copy reports the actual review count |
| Recording practice | Before a recording | `curious` |
| Recording practice | Permission pending, recording or saving | `focus`, with motion off |
| Recording practice | A recording is available to play back | `proud` for capturing a recording, not its pronunciation quality |
| Recording practice | Microphone or recording error | `encourage`, alongside the actual error and recovery guidance |
| Writing notes | A local review was requested after the word threshold | `proud` for the written practice; no writing grade is implied |
| Daily quests / Arena daily panel | No progress yet | `welcome` or `curious` |
| Daily quests / Arena daily panel | Some real progress, with tasks remaining | `encourage` |
| Daily quests / Arena daily panel | All nonempty daily missions complete | `celebrate` |
| Friends / invitation entry | Greeting the learner or offering a real invitation link | `welcome` |
| Community search / suggestions | No matching results or no suggestions left | `curious`, without a failure or loneliness message |
| Community feed | No local activity yet | `encourage`, with the existing lesson action |
| Achievements | At least one badge is already unlocked by game state | `proud`; no badge or XP is created by the illustration |
| Conversation | Initial help / an open hint / microphone active / voice error | `welcome` / `curious` / still `focus` / `encourage` |
| Conversation summary | A completed, saved session | `proud` |
| Shared challenge | Creating a room / waiting for a real person | `welcome` / `curious` |
| Shared challenge | Countdown or active timed turn | Still `focus` |
| Shared challenge result | Word goal reached / an actual turn saved below the goal | `proud` / `celebrate` for taking the turn |
| Shared challenge error | Network or save error | `encourage` |

## Keep the screen calm

- Use one Buddy per nearby task or feedback block. Workout feedback and completion keep their useful BuddyCoach tips/actions but hide that coach's second portrait when a state avatar is already present.
- Do not put a mascot on every word, mission row, badge or friend card. A single small header or empty-state avatar can explain the whole section.
- Keep the lesson, mic, answer field and next action dominant. Buddy should not cover copy, move a control or reveal an answer before the learner checks it.
- Freeze optional motion during mic use, permission processing and other focused moments. Respect reduced-motion preferences. Repeated looping celebrations should not compete with reading or listening.
- Decorative images have empty alternative text; nearby text carries the actual state and action. If an illustration alone carries information, provide localized alternative text.
- A changed expression never changes review status, badges, XP, timer results or account state. Existing local sample progress and fictional community profiles retain their labels. Challenges wait for actual people and expose browser-reported counts, not pronunciation scores or anti-cheat results.

Mood assets are selected through the shared `BuddyAvatar`. Both identities have a welcome pose and five distinct illustrations for focus, curiosity, encouragement, celebration and pride. Option 5 keeps the purple caterpillar with blue headphones; the original identity keeps the fuzzy blue speech-bubble Buddy with its tuft, arms and legs. Missing poses fall back to the active brand mascot, then the original mascot, with a small local face as the final fallback.
