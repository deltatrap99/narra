# Narra Option 5 visual skin

Option 5 is a separate visual variant of the same app. It preserves the lessons, saved vocabulary, four navigation destinations, tutor previews, browser speech, sharing, challenge rooms and existing functionality. It does not replace the Option 1 brand or change product copy.

The supplied Option 5 reference uses a purple, orange and pink ribbon N mark. The app skin follows that palette with clean lavender canvases, restrained glass navigation, white cards and violet primary actions. Logo artwork remains a supplied asset; this CSS does not recolor or redraw it. Quicksand headings and Nunito reading text remain unchanged.

| Role | Light mode | Dark mode |
| --- | --- | --- |
| Primary action | #5A24C9, white text | #5A24C9, white text |
| Action hover | #4920A6 | #4920A6 |
| Lilac accent | #9A7BFF | #9A7BFF |
| Orange accent | #FF661D | #FF661D |
| Pink accent | #F2A2CD | #F2A2CD |
| Reading ink | #14052F | #F8F1FF |
| Secondary text | #6D607E | #C4B4D3 |
| Canvas | #F7F3FE | #140B22 |
| Card surface | #FFFFFF | #211431 |
| Lavender emphasis | #EEE7FC | #302044 |
| Borders | #E3D8F2 | #493557 |
| Links and focus | #5A24C9 | #C9B5FF |

Orange highlights recording and time-sensitive states. Use dark ink on orange and pink; small body text uses the ink or link token. User chat bubbles and primary action buttons use violet with white text. Arena retains its instrument-panel layout on deep violet surfaces, with lilac telemetry. Tutor renders, user camera media, learning illustrations and personalized avatar colors are not filtered.

`src/brand-option5.css` is inert unless the HTML root has `data-brand="option5"`. Every CSS rule is scoped to that attribute, including dark-mode corrections. The build integration can select this attribute with `VITE_BRAND_VARIANT=option5`; build and URL selection remain outside the stylesheet. Import the skin after the existing global CSS. Its scoped selectors override the existing component palette without editing their source files.

Existing `--brand-lime` and `--brand-green-ink` names are compatibility aliases in this variant: they resolve to violet action and readable link roles respectively. They do not describe the displayed hue. Option 1 token files and synchronization script remain unchanged. Theme settings still choose Light, Dark or System independently of the brand variant.

The skin changes no model, audio, authentication, scoring or payment behavior. Existing sample-content notices and plan-preview limitations remain visible.

## Mascot name and expression

The mascot is named **Narry**. Refer to the learner as “bạn” and let Narry use its name and “tớ” in friendly Vietnamese guidance. Current emotion atlases have nine different body poses and emotions, selected by actual UI state. See `tools/narry-emotion-prompts.md` and `public/brand/narry-emotions-provenance.json`. Blue Narry has arms and legs; Option 5 remains an armless caterpillar.
