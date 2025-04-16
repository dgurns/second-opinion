# Second Opinion

Get a medical second opinion without ANY data leaving your device.

Uses Ollama, SQLite, and React Router.

<img width="100%" alt="Image" src="https://github.com/user-attachments/assets/24cd2fa0-0a03-4f04-a591-7d242a7b98a1" />

## Local Development Setup

1. Pull the local Ollama model and start the Ollama server:

```bash
ollama pull gemma3:4b

ollama serve
# Or run the desktop app to serve automatically
```

2. In a separate terminal, install app dependencies and start the development server:

```bash
pnpm install

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
