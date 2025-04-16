# Second Opinion

Get a medical second opinion without ANY data leaving your device.

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

The application uses the `gemma3:4b` model by default, which offers a good combination of speed and intelligence. You might also try `deepseek-r1:7b` which is a reasoning model and a bit smarter. Or try whatever model you'd like from https://ollama.com/library!

To change your model, run `cp .env.sample .env` and update the `OLLAMA_MODEL` value.

Make sure you have each model pulled locally with Ollama:

```bash
ollama pull gemma3:4b
```
