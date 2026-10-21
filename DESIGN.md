---
name: Basketball World Chronicle
description: A persistent global basketball universe, presented as one dark broadcast arena.
colors:
  void: "#060b11"
  rail: "#0a131d"
  stage: "#0d1722"
  panel: "#121f2c"
  panel-2: "#172838"
  panel-3: "#1d3246"
  sunk: "#0b1520"
  line: "#22374a"
  line-2: "#2f4b63"
  text: "#eef4f9"
  text-2: "#b6c6d4"
  text-3: "#8aa0b4"
  gold: "#f4b544"
  gold-ink: "#1a1203"
  hot: "#ef6b5b"
  live: "#4cc38a"
  blue: "#5fa8ff"
  grade-s: "#f4b544"
  grade-a: "#4cc38a"
  grade-b: "#5fa8ff"
  grade-c: "#a9b6c4"
  grade-d: "#f2924f"
  grade-e: "#ef6b5b"
  rarity-generational: "#ff5d73"
  rarity-legend: "#f4b544"
  rarity-epic: "#b28cff"
  rarity-rare: "#5fa8ff"
  rarity-uncommon: "#4cc38a"
  rarity-common: "#8c9cad"
typography:
  display:
    fontFamily: "Barlow Condensed, Manrope, sans-serif"
    fontSize: "clamp(2.1rem, 3.6vw, 3.3rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Barlow Condensed, Manrope, sans-serif"
    fontSize: "clamp(1.45rem, 2vw, 1.85rem)"
    fontWeight: 700
    lineHeight: 1.05
  title:
    fontFamily: "Barlow Condensed, Manrope, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.05
  scoreboard:
    fontFamily: "Barlow Condensed, Manrope, sans-serif"
    fontSize: "clamp(3.6rem, 6.5vw, 5.6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "tnum"
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "14px"
  xl: "18px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "#ffc65f"
  button-primary-lg:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "46px"
  button-secondary:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "38px"
  button-secondary-hover:
    backgroundColor: "{colors.panel-3}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "38px"
  input:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "38px"
  tab-pill:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "36px"
  tab-pill-active:
    backgroundColor: "{colors.text}"
    textColor: "{colors.rail}"
  chip:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.pill}"
    padding: "0 9px"
    height: "24px"
  rail-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    rounded: "9px"
    padding: "0 12px"
    height: "42px"
  rail-item-active:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.text}"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "20px"
  grade-chip:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.text}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    height: "32px"
  grade-chip-s:
    backgroundColor: "{colors.grade-s}"
    textColor: "#0b1218"
---

# Design System: Basketball World Chronicle

## Overview

**Creative North Star: "Broadcast Command Center"**

The simulator is presented as a live global sports broadcast. A midnight command rail holds the six destinations; a sticky season bar keeps the current moment and the next action in view; content plays inside a deep arena-blue stage built for long sessions. Everything is one dark theme: there is no light mode and no light card floating on dark ground. Depth comes from stepping navy surfaces lighter, not from contrast flips.

Density is broadcast-graphic, not spreadsheet. Numbers are set in a condensed display face at scoreboard scale, every rating reads as a letter grade before it reads as a number, and the four team strengths are drawn as meters scaled against the league so differences between real teams are visible. Team identity arrives through badges, swatches, and tinted washes; it never carries small text.

Prestige is warm, everything else is cool. Gold marks command and honor; the grade and rarity scales carry their own fixed hues; team colours are lifted to read on dark and are kept apart from gold.

**Key Characteristics:**
- One dark arena theme: void → rail → stage → panel → panel-2 → panel-3, all navy.
- Condensed display numerals (Barlow Condensed) over a Manrope UI layer with tabular figures everywhere.
- S–E letter grades on one world-wide threshold scale; league-relative strength meters.
- Compact icon rail with inline sub-pages on desktop; sticky season bar; six-tab bottom bar on phone.
- Authored 24px / 1.8-stroke line icons; no emoji or glyph icons.

## Colors

A cool, deep-navy arena lit by a single warm gold, with fixed semantic hues for grades, rarity, and state.

### Primary
- **Trophy Gold** (`gold`): command and prestige. Primary buttons, the active rail icon, the active bottom-tab, focus rings, the current season week, the S grade, titles, honor years, award winners, draft pick numbers, retired-jersey numbers. Text on gold is always **Gold Ink** (`gold-ink`), never white.

### Secondary (state)
- **Arena Red** (`hot`): live and critical. The pulsing live dot, live status, clutch moments, championship-night finale, negative deltas, E grade.
- **Court Green** (`live`): positive and complete. Done steps, positive deltas, scoring surges, A grade.
- **Broadcast Blue** (`blue`): neutral information and coaching meters; B grade.

### Grade scale
- **S** (`grade-s`, gold) ≥ 88 · **A** (`grade-a`) ≥ 82 · **B** (`grade-b`) ≥ 76 · **C** (`grade-c`, steel) ≥ 70 · **D** (`grade-d`, amber) ≥ 63 · **E** (`grade-e`, red) below. Thresholds are world-level: the same letter means the same thing for a team, player, or coach.

### Rarity scale
- Generational, Legend, Epic, Rare, Uncommon, Common (`rarity-*`): a person's permanent tier, drawn as a portrait frame ring, a tinted pill, and a faint card wash. Rarity never substitutes for grade.

### Neutral
- **Void** (`void`): page ground, under two soft radial navy glows.
- **Rail** (`rail`): command rail, season bar (at 92% with blur), bottom bar.
- **Panel / Panel 2 / Panel 3** (`panel`, `panel-2`, `panel-3`): resting surface, raised or hovered surface, active or pressed surface.
- **Sunk** (`sunk`): inputs, meter tracks, table headers, inset wells.
- **Line / Line 2** (`line`, `line-2`): hairline dividers and borders; the stronger step for interactive borders.
- **Text / Text 2 / Text 3** (`text`, `text-2`, `text-3`): primary, secondary, tertiary. `text-3` is the floor; it holds above 6:1 on `panel`.

### Named Rules
**The Gold Is Earned Rule.** Gold means command (primary action, active location, current moment) or prestige (S grade, titles, honors). It is never a team colour, a category tint, or decoration. When two team colours collide, the fallback is blue or red, never gold.

**The Swatch Not Script Rule.** Team identity colours appear as badges, swatches, meter fills, underline marks, and low-opacity washes. Text in a team colour is not allowed; names stay in `text`.

**The Lifted Jersey Rule.** Team colours are authored for white jerseys. Before use on dark, lift any colour below 0.16 relative luminance by raising lightness at constant hue (saturation floored at 0.62); near-greys become `#c9d6e2`. Two teams within 42° hue and 0.18 luminance of each other are separated by swapping the second to blue or red.

## Typography

**Display Font:** Barlow Condensed (fallback Manrope, sans-serif), weights 600–800
**Body Font:** Manrope (fallback ui-sans-serif, system-ui), weights 400–800

**Character:** A condensed sports-graphics face for every name, score, grade, and heading, over a calm geometric sans for everything you read or press. Tabular figures are on at the root.

### Hierarchy
- **Scoreboard** (800, clamp(3.6rem, 6.5vw, 5.6rem), 0.9): live and final scores, year-end numerals.
- **Display** (700, clamp(2.1rem, 3.6vw, 3.3rem), 1.05): page heroes, entity names, world hero (up to 3.9rem).
- **Headline** (700, clamp(1.45rem, 2vw, 1.85rem), 1.05): section and page headings.
- **Title** (700, 1.2rem, 1.05): card titles, metric values, grade letters.
- **Body** (400, 15px, 1.6): paragraphs in `text-2`; long copy capped at 56–70ch.
- **Label** (700, 0.74rem, normal tracking, sentence case): metric labels, table headers, filter labels, in `text-3`.

### Named Rules
**The No Eyebrow Rule.** Nothing sits above a heading. Context (country, region, status) goes on a metadata line below the heading in sentence case, untracked. No uppercase tracked kickers.

**The Condensed Numbers Rule.** Any number that is the point of its element (score, grade, rating, stat, year) is set in the display face, bold, tabular.

## Layout

Desktop is rail-and-stage: a 232px sticky rail (208px under 1100px) beside a fluid stage; content max 1480px with 26px / 28px padding. The season bar is sticky at the top of the stage, 68px tall, translucent rail with 10px blur, holding the season clock, a sim hint, the advance controls, and the next-game chip.

Under 820px the rail disappears. Navigation moves to a fixed six-tab bottom bar (52px targets plus safe-area inset); the section's sub-pages become a sticky, horizontally scrolling pill row under the season bar; main gets 96px bottom padding. Multi-column layouts collapse to one column, tables keep full fidelity and scroll horizontally rather than shrinking type.

Rhythm sits on 6 / 10 / 14 / 18 / 28px: 6px inside chip rows, 10–14px inside cards and lists, 18px between panels, 28px for page and hero gutters. Grids use auto-fill tracks of 250–340px minimum.

## Elevation & Depth

Tonal layering first, one soft shadow second. Surfaces step lighter as they come forward (panel → panel-2 → panel-3). Resting panels carry one shared shadow; hover lifts cards 2px with a deeper shadow. Heroes add a radial wash, tinted by gold for prestige moments or by team colour for team and live surfaces.

### Shadow Vocabulary
- **Panel rest** (`box-shadow: 0 1px 0 rgb(255 255 255 / .03) inset, 0 10px 28px -12px rgb(0 0 0 / .55)`): every panel, hero, and archive band.
- **Card lift** (`box-shadow: 0 16px 30px -18px rgb(0 0 0 / .8)`): hovered team cards.
- **Arena drop** (`box-shadow: 0 30px 60px -30px rgb(0 0 0 / .9)`): the live-game hero only.

### Named Rules
**The Navy Steps Rule.** Raise a surface by moving one step up the navy ladder, never by switching to a light surface or adding a coloured edge.

## Shapes

Softly rounded, never pill-shaped containers. Controls 8px, panels and cards 12px, feature cards 14px, heroes 16–18px. Pills (999px) are reserved for chips, tabs, status, and rarity. Borders are 1px hairlines in `line`; dashed borders mean empty. Portraits are 12px rounded squares ringed in their rarity colour; team badges and the brand mark are circles; competition emblems are shields.

## Components

### Buttons
- **Shape:** gently rounded (8px), 38px tall; large 46px.
- **Primary:** gold fill, gold-ink text, 700 weight. One per region: advance, play, next game.
- **Secondary:** panel-2 fill, line-2 border, text colour; hover to panel-3.
- **Ghost / Danger:** transparent; danger uses a muted red border and pale red text.
- **Hover / Focus:** 180ms out-expo colour shift; active nudges 1px down; focus is a 2px gold outline at 2px offset.

### Chips
- **Style:** 24px pill, sunk fill, line border, text-2, 0.74rem bold.
- **Variants:** team-era chips tint toward the grade scale (dynasty and champion gold, contender green, competitive blue, rebuild amber); rarity pills tint toward the rarity hue at 15% fill / 45% border.

### Cards / Containers
- **Corner Style:** 12px (panels), 14px (team, lineup, award cards).
- **Background:** panel; person cards wash 9–12% of rarity colour into panel-2; team cards wash 13% of team colour at the top.
- **Shadow Strategy:** Panel rest; lift on hover.
- **Border:** 1px line; hover moves to line-2 or a rarity-tinted border.
- **Internal Padding:** 16–20px.

### Inputs / Fields
- **Style:** sunk fill, line-2 border, 8px radius, 38px, gold caret.
- **Focus:** gold focus ring; hover strengthens the border.

### Navigation
- **Rail:** six destinations labelled World, Live, Stories, Records, People, Market, each with an authored icon. Items 42px, text-2; hover panel; active panel-2 with text colour and a gold icon. Sub-pages of the active destination open inline beneath it as 34px text rows; the active sub-page gets a faint gold wash. A pulsing red dot on Live marks an active showcase.
- **Season bar:** sticky; season year in display 2.1rem, week in gold; advance controls; the next-game chip in a gold-bordered gradient with a gold call to action.
- **Phone:** six-tab bottom bar (icon over 0.68rem label); active tab gold with an 8% gold wash. Sub-pages become a pill row; the active pill inverts to text fill.
- **In-page tabs:** pill tabs, active inverts to text fill with rail-coloured text. Detail tabs sit in a sunk segmented track; active is panel-3 with a 2px gold underline.

### Grade chip (signature)
A split chip: the letter on a solid grade-coloured block in display 800, the number beside it in display 700 on a 16% grade wash with a 55% grade border. Sizes 24 / 32 / 42 / 52 / 64px. Every rating in the world is shown this way.

### Strength meters (signature)
Four rows (Perimeter, Interior, Defense, Rebounding): label, a 6px sunk track (10px large), value. Fill maps 50–99 onto the track (minimum 4%) and takes its colour from the grade of that value, so a meter is league-relative and graded at once.

### Live game (signature)
A scoreboard hero washed by both teams' lifted colours from either side. The leader is marked in the leader's team colour: a "Leading" pill under the name, a 56px underline mark under the score, the trailing score dimmed to text-3. A tug bar fills from the centre toward the leader, with team swatches at each end and a verbal margin beneath ("Duke by 8"). The lead chart is scaled only from minutes already played so it never reveals a coming lead.

## Do's and Don'ts

### Do:
- **Do** show every rating as a grade chip using the 88 / 82 / 76 / 70 / 63 thresholds.
- **Do** pass every team colour through the lift rule before it touches a dark surface, and separate colliding pairs with blue or red.
- **Do** mark a leader with the leader's team colour as a fill, swatch, or underline, and say the margin in words.
- **Do** scale any live chart or meter only from information already revealed.
- **Do** use the authored 24px, 1.8-stroke, round-cap icon set for every icon.
- **Do** keep text at `text-3` or brighter on any surface.

### Don't:
- **Don't** introduce a light theme, light cards, or a second palette.
- **Don't** use gold for team identity, category tints, or decoration.
- **Don't** set text in a team colour.
- **Don't** put an eyebrow or tracked uppercase label above a heading.
- **Don't** mark state with a coloured side stripe on cards, rows, or callouts.
- **Don't** use emoji or text glyphs as icons.
- **Don't** shrink table type on phones; let the table scroll.
