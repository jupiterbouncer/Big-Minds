# Pathway Explorer (Big Minds)

An interactive, non-prescriptive career and skill exploration platform designed for Grade 5–6 students (ages 10–12). Students explore curiosity domains, follow interconnected pathways, complete micro-activities, and discover learning journeys without being forced into a rigid career label.

## Features

- **Kid-Tech Modern UI**: Built with a soft tactile design language, rounded surfaces, and distinct color-coded interest tags.
- **Dynamic Interest Scoring**: Automatically calculates relevance scores ($relevanceScore = \vert{}selectedInterests \cap nodeTags\vert{}$) to visually highlight matching pathways while keeping connected branches fully accessible.
- **Interactive SVG Canvas**: Custom-built interactive canvas with panning, zooming, node selection, and animated bezier curve edges.
- **Curiosity Quiz**: Quick 3-question quiz for students who need help deciding where to start.
- **Hands-on Micro-Activities**: In-drawer interactive mini-challenges (Scratch block ordering, Python greet code, live CSS style pickers, frame-rate animators, password testers).
- **Local Persistence**: State automatically persists to browser `localStorage` across reloads.

## File Overview

- `index.html`: Core HTML structure and layout containers.
- `css/styles.css`: Custom animations, canvas styling, and soft shadow effects.
- `js/pathwaysData.js`: Central dataset for pathway nodes, cross-functional edges, and quiz questions.
- `js/canvas.js`: SVG edge graph generation, node coordinate rendering, and pan/zoom transform handling.
- `js/app.js`: Main state engine, local storage management, event listeners, micro-activity logic, and quiz handlers.

## Getting Started

Simply open `index.html` in any browser or launch it using VS Code **Live Server**. No build tools or Node package installs required.
