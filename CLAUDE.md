# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpreadLine is a visualization framework for exploring egocentric dynamic networks from the perspective of a central node (ego). It implements the research paper "SpreadLine: Visualizing Egocentric Dynamic Influence" (IEEE TVCG 2024). The tool shows how influence spreads through networks over time, centered around a focal actor.

The paper is https://arxiv.org/pdf/2408.08992

## Common Commands

### Next.js App (root level)
```bash
npm run dev                      # Start Next.js dev server
npm run build                    # Build for production
npm run start                    # Start production server
```

### Python Package Installation
```bash
pip install .                    # Install package
pip install -e .                 # Install in editable mode for development
```

### Demo Application (SpreadLine-main)
```bash
# From demo/frontend directory
npm install                      # Install frontend dependencies
npm run start                    # Run full stack (Flask backend + Vite frontend concurrently)
npm run dev                      # Frontend only (Vite dev server on port 5173)
npm run build                    # Build frontend for production

# Backend runs on port 5300
```

## Architecture

### Processing Pipeline

The `SpreadLine` class in `SpreadLine/spreadline.py` orchestrates a 5-phase pipeline:

1. **load()** - Accepts CSV/JSON/DataFrames for topology, content, node/line colors
2. **center()** - Filters to 2-hop egocentric neighborhood, constructs temporal sessions
3. **fit()** - Runs optimization pipeline:
   - **Ordering** (`order.py`) - Crossing reduction via barycenter algorithm
   - **Aligning** (`align.py`) - Maximizes straight lines using longest common substring
   - **Compacting** (`compact.py`) - Minimizes whitespace or line wiggles
   - **Contextualizing** (`contextualize.py`) - Optional PCA-based attribute positioning
   - **Rendering** (`render.py`) - Generates SVG paths as JSON

### Core Data Structures (utils/types.py)

- `Entity` - Timeline of session involvement for a network actor
- `Session` - Snapshot of interactions at one timestamp (form: 'contact' or 'idle')
- `Node` - Entity at a specific timestep with order/session info
- `Path` - D3-style SVG path generation (bezier curves, arcs)

### Demo Stack

- **Frontend**: Vanilla JS + D3.js v7, built with Vite
- **Backend**: Flask server with endpoints in `demo/backend/views.py`
- **Case Studies**: `metoo/` (#MeToo network), `vis-author/` (visualization researchers)

## Key Files

- `SpreadLine/spreadline.py` - Main orchestrator class
- `demo/backend/views.py` - Flask endpoints (`computeJHSpreadLine`, `computeMetooSpreadLine`, etc.)
- `demo/frontend/interface.js` - D3 visualization setup
- `sample.py` - Quick start example

## NumPy Compatibility

This codebase requires NumPy 2.x compatible code. Use `np.isin()` instead of the deprecated `np.in1d()`.

## Instruction when answering the prompt
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY