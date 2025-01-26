# Second Opinion

A medical assistant that provides second opinions on medical details using local LLMs.

## Local Development Setup

1. Start the Ollama server:

```bash
ollama serve
```

2. In a separate terminal, start the development server:

```bash
pnpm dev
```

The application will be available at http://localhost:5173

## Prerequisites

- [Ollama](https://ollama.ai/) installed locally
- [pnpm](https://pnpm.io/) for package management
- Node.js 18+ installed

## Models

The application uses the `deepseek-r1:7b` model by default. Make sure you have it pulled in Ollama:

```bash
ollama pull deepseek-r1:7b
```
