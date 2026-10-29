---
name: cybermedia-design-system
description: >
  Design system, UI/UX conventions, typography rules, brand stylesheets, and layout
  standards for the CyberMedia AI Editorial Copilot (Dataquest, Voice&Data, PCQuest, CIOL).
  Activate when creating or modifying any frontend component, layout, font, color, or logo.
---

# CyberMedia Editorial Design System & UI/UX Standards

This document defines the strict publication design system, typographic hierarchy, brand identities, and layout guidelines for the **CyberMedia AI Editorial Copilot**.

---

## 1. Brand Identities & Palette

| Publication | Code | Accent Hex | Domain | Audience Focus |
| :--- | :--- | :--- | :--- | :--- |
| **DATAQUEST** | `DQ` | `#e30613` (CyberMedia Red) | `dqindia.com` | CXOs, Enterprise IT, Cloud, Semiconductors, AI Policy |
| **VOICE&DATA** | `V&D` | `#00839b` (Telecom Teal) | `voicendata.com` | Telecom, 5G, Satcom, Networking, TRAI / DoT Policy |
| **PCQUEST** | `PCQ` | `#2563eb` (Tech Blue) | `pcquest.com` | PC Hardware, Gadgets, SMB IT, Labs Benchmarks |
| **CIOL** | `CIOL` | `#c8102e` (Editorial Crimson) | `ciol.com` | Tech Business, Digital Transformation, CIO Strategies |

---

## 2. Master Typography Hierarchy

Never introduce arbitrary user-controllable font size steppers. Maintain the official CyberMedia typographic scale:

- **Article Headline (H1)**: `text-2xl sm:text-3xl font-black` (28px–32px), leading-tight (1.2), tracking-tight.
- **Section Headings (H2)**: `text-lg sm:text-xl font-bold` (20px–22px), leading-snug, mt-6 mb-3.
- **Sub-Headings (H3)**: `text-base font-bold` (16px), mt-4 mb-2.
- **Body Paragraphs**: `text-[16px] sm:text-[17px]` with `leading-[1.75]` (28px line-height) and `mb-4`.
- **Metadata & Tags**: `text-[11px] sm:text-[12px] font-semibold`.

---

## 3. Publication Editorial Stylesheet Mandates

### A. Headline & Subhead Casing (Non-Negotiable)
- **Dataquest, Voice&Data, PCQuest**:
  - **MANDATORY SENTENCE CASE**: Capitalise ONLY the first word and recognized proper nouns / acronyms (e.g. *"Coursera unveils project Helix platform and partners with IIMBx"*).
  - **NEVER** use Title Case for DQ, V&D, or PCQ!
- **CIOL**:
  - Uses **Title Case** (Capitalise Every Significant Word).

### B. Prohibited Characters & Language
- **NO EM-DASHES (`—`)**: Never output em-dashes in running text. Replace them with standard commas or sentence breaks.
- **NO EMPHASIS QUOTES**: Strip single quotes around themes, slogans, or campaign names (e.g. write `theme Human Skills. AI Scale.` without quotes).
- **DOUBLE QUOTES FOR VERBATIM SPOKESPERSON QUOTES ONLY**: Preserve executive spokesperson quotes verbatim inside double quotes at the bottom of the article.
- **STRICT UK ENGLISH**: Use `-ise` (specialise, organise), `programme`, `centre`, `fibre`, `colour`, `enrolment`.
- **ABSOLUTE PROHIBITION OF MARKETING HYPE**: Strictly purge buzzwords:
  *`"stylish"`, `"highly anticipated"`, `"must-have"`, `"act fast"`, `"game-changer"`, `"revolutionary"`, `"unmatched"`, `"world-class"`, `"cutting-edge"`, `"leading"`, `"best-in-class"`, `"groundbreaking"`, `"don't miss out"`, `"buy now"`, `"unbeatable"`, `"state-of-the-art"`, `"stunning"`, `"impressive"`*.

---

## 4. Logo & Media Presentation Rules

- **Clean & Transparent**:
  - Logos (`DQlogo.webp`, `VandDLOGO.webp`, `PCquestLogo.webp`, `cybermediaLogo.png`) must **NEVER** have white background boxes, borders, or shadows.
  - Set container background to `bg-transparent` with `shadow-none`.
- **No Redundant Typography**: Do not repeat publication text names next to brand logo images.
- **Cover Banner Images**:
  - Always maintain natural **16:9** aspect ratio (`1280x720`).
  - Use `object-contain` or `object-cover` without clipping top or bottom content on desktop viewports.
  - Support multi-image grid/gallery when 2 or 3 images are generated.

---

## 5. Viewport & Layout Architecture

- **Desktop Layout (`lg:`)**:
  - Full-viewport height: `min-h-screen lg:h-screen lg:overflow-hidden flex flex-col`.
  - Main workspace: 2-column balanced grid `grid-cols-1 lg:grid-cols-2`.
  - Zero horizontal overflow.
  - Independent scrolling for left generator panel and right output preview panel.
- **Left Panel (GeneratorForm)**:
  - Step 1 ("Paste Press Release") must use `flex-1` with dynamic textarea so it expands naturally to fill all available vertical space, eliminating dead white space.
  - Steps 2 & 3 neatly dock at the bottom above the pinned sticky "GENERATE ARTICLE" button.

