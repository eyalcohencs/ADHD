# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Mission

**ADHD Cognitive Platform for Kids** — An AI-powered, game-based platform that identifies, supports, and empowers children with ADHD and related cognitive challenges, providing personalized insights, emotional reinforcement, and actionable guidance for families and professionals.

### Success Pillars

1. **Clinical Impact:** Early, accurate identification of attention and regulation patterns
2. **Emotional Empowerment:** Children and parents feel seen, supported, and hopeful
3. **Scalable Innovation:** A validated POC ready for partnerships, pilots, and funding

### Current Phase: Phase 1 — Discovery & Clinical Framing (Weeks 1–8)

**Key Objectives:**
- Build 4 validated cognitive mini-games
- Develop parent dashboards with strength-based feedback
- Establish ethics & privacy framework (GDPR, Israeli law compliance)
- Prepare for pilot with 50+ families

**Team Structure:**
- **Shemer** (Clinical Lead) — ADHD expertise, cognitive domain mapping, strength-based content
- **Yonas** (Product Manager) — UX, coordination, pilot planning, compliance
- **Cohen** (Tech Lead) — Technical architecture, mini-game development, data logging

### Clinical Context

The **Kohs Block Design Test** is a well-established cognitive assessment measuring:
- Visual-spatial processing
- Problem-solving abilities
- Attention and focus patterns
- Fine motor coordination

This implementation tracks:
- Reaction times per cell
- Click patterns and sequences
- Completion time
- Error patterns (used for identifying cognitive strengths/challenges)

## Technical Overview

This is an Angular 18 web application using modern standalone components (no NgModules), Signal-based reactivity, and TypeScript with strict type checking.

**Repository:** https://github.com/eyalcohencs/ADHD
**Main Application:** `/client/adhd-game/`
**Backend:** `/app/` (currently empty, for future backend development)

## Development Commands

All commands should be run from the `/client/adhd-game/` directory:

```bash
# Start development server (http://localhost:4200)
npm start

# Build for production (outputs to dist/adhd-game/)
npm build

# Build in watch mode for development
npm watch

# Run unit tests (Karma + Jasmine on http://localhost:9876)
npm test

# Angular CLI commands
npx ng serve
npx ng build
npx ng test
npx ng generate component <name>
```

## Architecture

### Technology Stack

- **Framework:** Angular 18.2.0 (standalone components)
- **Language:** TypeScript 5.5.2 (strict mode enabled)
- **Styling:** SCSS with component-scoped styles
- **State Management:** Angular Signals (signal, computed)
- **Testing:** Jasmine 5.2.0 + Karma 6.4.0
- **Build Tool:** Angular CLI 18.2.5 with Vite

### Application Structure

```
client/adhd-game/
├── src/
│   ├── app/
│   │   ├── app.component.*           # Root component
│   │   ├── app.config.ts             # Application configuration
│   │   ├── app.routes.ts             # Routing (currently empty)
│   │   └── kohs-game/                # Kohs game component
│   │       ├── kohs-game.component.ts
│   │       ├── kohs-game.component.html
│   │       ├── kohs-game.component.scss
│   │       └── kohs-game.component.spec.ts
│   ├── main.ts                       # Application entry point
│   ├── index.html                    # HTML template
│   └── styles.scss                   # Global styles
├── angular.json                      # Angular CLI configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies and scripts
```

### Key Architectural Patterns

1. **Standalone Components:** All components use `standalone: true`, eliminating the need for NgModules
2. **Bootstrap Pattern:** Uses `bootstrapApplication()` in `main.ts` instead of NgModule bootstrap
3. **Signal-based Reactivity:** Uses Angular 16+ Signals (`signal()`, `computed()`) for reactive state management
4. **Component Colocation:** Each component has its own directory containing .ts, .html, .scss, and .spec.ts files

### Current Components

**AppComponent** (`app.component.ts`)
- Root component that embeds the main game
- Minimal container with title property

**KohsGameComponent** (`kohs-game/kohs-game.component.ts`)
- Main game mechanics: 4x4 grid of rotatable cells
- Each cell contains a square with a triangle pointer
- Click interaction rotates cells 90 degrees
- Tracks cell states (position, angle, clicked status)
- Uses SVG for rendering with CSS transitions
- State managed with Angular Signals

### TypeScript Configuration

The project uses strict TypeScript compilation:
- `strict: true` - Full type checking enabled
- `noImplicitReturns: true` - All functions must return values
- `noFallthroughCasesInSwitch: true` - Switch cases must break/return
- `strictTemplates: true` - Full template type checking in Angular
- Target: ES2022

### Testing

- Test files use `.spec.ts` suffix
- Run tests with `npm test`
- Tests run in Chrome via Karma
- Configuration in `karma.conf.js` (auto-generated by Angular CLI)
- TypeScript test configuration in `tsconfig.spec.json`

## Development Guidelines

### Component Development

When creating new components:
1. Use standalone components: `ng generate component <name> --standalone`
2. Import required dependencies directly in the component's `imports` array
3. Use Signals for reactive state: `signal()` for mutable state, `computed()` for derived values
4. Place each component in its own directory with all related files

### State Management

- Use **Signals** for component-local state (not RxJS Observables)
- Update signals with `.set()` or `.update()` methods
- Access signal values with `signal()` syntax in templates
- Use `computed()` for derived reactive values

Example:
```typescript
cells = signal<Cell[]>(this.initCells());
boardSize = computed(() => this.cols * this.cellSize + (this.cols - 1) * this.gap);

// Update signal
this.cells.update(arr => arr.map(c => (c.index === cell.index ? cell : c)));
```

### Styling

- Use SCSS for component styles
- Component styles are scoped by default (ViewEncapsulation.Emulated)
- Global styles go in `src/styles.scss`
- Follow existing patterns: CSS Grid for layout, modern CSS properties

### Code Style

- **Indentation:** 2 spaces (enforced by .editorconfig)
- **Quotes:** Single quotes for TypeScript
- **Line endings:** LF
- Trim trailing whitespace

## Data & Privacy Considerations

**CRITICAL:** This platform collects cognitive assessment data from children. All development must consider:

1. **Parental Consent:** Require explicit consent flows before data collection
2. **Data Minimization:** Only collect data necessary for clinical assessment
3. **Secure Storage:** All sensitive data must be encrypted and stored securely
4. **Compliance:** GDPR (European) and Israeli privacy law requirements
5. **Child Safety:** No identifiable information should be exposed in logs or error messages
6. **Ethical AI:** AI-generated insights must be explainable and clinically validated

**When implementing features:**
- Never log personally identifiable information (PII)
- Use anonymized/pseudonymized IDs for data tracking
- Implement proper error handling that doesn't expose sensitive data
- Consider data retention policies
- Document what data is collected and why

## VS Code Integration

The project includes VS Code configuration:

**Debug Configurations:**
- "ng serve" - Debug development server on localhost:4200
- "ng test" - Debug tests on localhost:9876/debug.html

**Recommended Extensions:**
- `angular.ng-template` - Angular template support

## Build & Production

- Production build outputs to `dist/adhd-game/`
- Build budgets set warnings at 500kB, errors at 1MB for initial bundle
- Component styles limited to 2kB warning, 4kB error
- Production builds are optimized and minified with hashed filenames

## Roadmap & Current Status

### Completed
- ✅ Tech stack selection (Angular 18 + TypeScript)
- ✅ Repository structure established
- ✅ First cognitive mini-game prototype (Kohs Block Design)

### In Progress (Phase 1)
- 🔄 Cognitive domain mapping (4 domains)
- 🔄 Parent dashboard wireframes
- 🔄 Data logging implementation
- 🔄 Pilot plan development

### Upcoming
- 🔜 3 additional cognitive mini-games
- 🔜 Backend API for data storage (`/app/` directory)
- 🔜 Parent dashboard with strength-based feedback
- 🔜 AI scoring correlation with clinical assessments (target: 70%)
- 🔜 Pilot with 50+ families

## Notes

- **Current Focus:** Building reaction-time mini-game demo (v0) with data logging
- Routing is configured but currently empty (`app.routes.ts`) — will be used for multiple game screens
- No backend integration yet (backend directory `/app/` is empty) — planned for Phase 1
- Project uses modern Angular features (v18): standalone components, Signals, and new control flow syntax
- This is a POC/MVP targeting clinical validation and funding partnerships
