# WORDLY — React Native app

Implementation of the `WORDLY Türkçe Dil Uygulaması` design handed off from Claude
Design (`../project/WORDLY.dc.html`). All 34 screens of the prototype are built as a
React Native app on Expo SDK 57, in Turkish, targeting iOS and Android at the
design's 390 × 844 frame.

## Running it

```bash
npm install
npx expo start          # then press i / a, or scan the QR code with Expo Go
```

A development build is not required — every native module used here
(`expo-linear-gradient`, `expo-blur`, `expo-haptics`, `expo-font`,
`react-native-svg`, `react-native-screens`, `react-native-safe-area-context`,
`react-native-gesture-handler`) ships in Expo Go.

Useful checks:

```bash
npx tsc --noEmit                      # type check
npx expo export --platform ios        # verify the bundle builds
```

## Layout

```
App.tsx                  fonts, providers, navigation container
src/
  theme/                 design tokens + the CSS font shorthand mapped onto props
  components/            the primitives every screen is assembled from
  data/                  all copy and mock content, typed and swappable for an API
  navigation/            root stack, tabs, and `go()` keyed by the design's screen ids
  screens/               one file per screen, numbered in the design's order
  state/                 app-wide state (toast, onboarding answers, game progress)
```

### Navigation

The design's `TABS` array decides which screens keep the bottom navigation, and the
navigator mirrors it exactly: `home`, `learn`, `map`, `lesson`, `coach`, `play`,
`social`, `friends`, `clubs`, `profile`, `achv`, `stats`, `sub` and `settings` live
inside a tab's stack; everything else is a full-bleed screen on the root stack.

Screens are addressed by the design's own ids — `go('lesson')`, `go('arena')` — via
`src/navigation/routes.ts`, which maps each id to its place in the navigator. Back
buttons pop the stack when they can and otherwise fall back to the screen the
design's `‹` pointed at.

The three reference screens (`tokens`, `empty`, `errors`) are registered as
`DesignTokens`, `EmptyStates` and `ErrorStates`. Nothing in the product UI links to
them — the prototype only reached them from its own screen list — so navigate to
them directly when you want to review the system.

### Data

Every word, question, leaderboard row, notification and string from the prototype
lives in `src/data/` as typed modules. No network calls: swap a module's export for a
fetch and the screens are unchanged.

## How the CSS translated

| Design | Here |
| --- | --- |
| `linear-gradient(135deg, …)` | `<Gradient deg={135}>` (expo-linear-gradient, angle converted to start/end) |
| `radial-gradient(...)` screen washes | `<Glow>` — SVG ellipses with a radial fill |
| `conic-gradient(...)` rings | `<ProgressRing>` — an SVG stroke arc |
| `box-shadow` | RN 0.86 accepts the CSS string directly, so the values are verbatim |
| `backdrop-filter: blur()` | `expo-blur` on the tab bar and the glass surface sample |
| `repeating-linear-gradient` art | `<StripeArt>` — an SVG pattern |
| `font: 800 17px Manrope` | `<Txt f="m" s={17} w={800}>` |
| `@media (prefers-reduced-motion)` | `useReduceMotion()`, which every animation honours |

## Deviations from the prototype, and why

- **The status bar is real.** The prototype drew a fake `9:41` bar and a dynamic
  island inside its frame; screens here use safe-area insets instead, growing the
  design's top padding when the device inset is larger.
- **Leaderboard got a back button.** In the prototype `board` has neither a back
  control nor the bottom bar, so it was a dead end reachable only from the design's
  own screen list. It is pushed on the root stack here, and the header carries the
  same `‹` control the other detail screens use.
- **Vibration is wired up.** The settings screen lists "Titreşim · Harf seçimi ve
  kombo", so letter taps and arena results fire haptics.
- **Bottom padding on non-tabbed screens** is the design's `40px` rather than the
  `112px` several of them carried, since there is no tab bar there to clear.

## Still placeholder

Carried over from the design's own list of next steps: the app icon and the
illustration/photo slots are still striped placeholders labelled with the asset they
need (`görsel: harf arenası sahnesi`, `görsel: tren penceresi fotoğrafı`, and the
empty-state art). Tablet and desktop layouts, and the detailed battle-royale and
tournament screens, were out of scope for the prototype too.
