# Repository Guidelines

## Project Structure & Module Organization

This repository is a TechCorp AI challenge workspace. The root contains the mission brief (`readme.md`, `CONSIGNES.md`) plus shared assets and deliverables.

- `rendu/devweb/`: Vite + React + TypeScript chat interface for the financial assistant. UI components live in `src/components/ui/`, app logic in `src/App.tsx`, and Ollama helpers in `src/lib/ollama.ts`.
- `ollama_server/`: Ollama `Modelfile` for the `phi3-financial` model.
- `scripts/`: Python utilities for model training and local chat experiments.
- `datasets/`, `models/`, `model_repository/`: datasets, LoRA/model artifacts, and Triton model repository files.
- `rendu/cyber/` and `rendu/Infra/`: security and infrastructure deliverables.

## Build, Test, and Development Commands

Run frontend commands from `rendu/devweb/`:

```bash
npm install              # install React/Vite dependencies
cp .env.example .env.local
npm run dev              # start Vite on http://localhost:5173
npm run build            # type-check and build
npm run lint             # run oxlint
npm run preview          # preview the production build
```

Ollama is expected at `http://localhost:11434`. From the repository root:

```bash
ollama create phi3-financial -f ollama_server/Modelfile
ollama run phi3-financial
```

For Python scripts, install `scripts/requirements.txt` in a virtual environment before running training or chat utilities.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and the existing `@/*` path alias in `rendu/devweb`. Keep reusable UI primitives under `src/components/ui/` and model/API code under `src/lib/`. Follow the current shadcn/Tailwind style and prefer small, typed helpers over inline networking logic. Use 2-space indentation for TS/TSX and 4 spaces for Python.

## Testing Guidelines

There is no frontend unit test runner configured yet, so treat `npm run lint` and `npm run build` as required checks. For model safety validation, run:

```bash
BASE_URL=http://localhost:11434 python3 rendu/cyber/robustness_tests.py
MODEL=phi3.5 python3 rendu/cyber/robustness_tests.py
```

When adding tests, name frontend tests `*.test.tsx` near the component and keep Python tests under a `tests/` directory.

## Commit & Pull Request Guidelines

Git history uses short imperative summaries such as `Fix DEV WEB Ollama configuration` and `Add CYBER security audit deliverables`; keep that style. PRs should include a concise scope summary, commands run, linked task/issue when available, and screenshots or short recordings for UI changes.

## Agent-Specific Instructions

Prefix shell commands with `rtk` when working as an agent, for example `rtk git status` or `rtk npm run build`. If debugging requires unfiltered output, use `rtk proxy <command>`.
