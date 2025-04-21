# Second Opinion

Get a medical second opinion without ANY data leaving your device.

Uses Ollama, SQLite, and React Router.

<img width="100%" alt="Image" src="https://github.com/user-attachments/assets/24cd2fa0-0a03-4f04-a591-7d242a7b98a1" />

## Local Development Setup

1. Copy the `.env.sample` file to `.env`:

```bash
cp .env.sample .env

# Optional: Customize values if you want
```

2. Download the local LLM and serve it via Ollama:

```bash
# Pull the model of your choice
ollama pull gemma3:4b

# Serve the model
ollama serve

# Or run the Ollama desktop app to serve automatically
```

3. In a separate terminal, install dependencies, initialize the database, and start the development server:

```bash
# Install dependencies
pnpm install

# Initialize the local database
pnpm db:push

# Start the development server
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

## Troubleshooting

If you notice that the LLM completion is getting cut off, it might be because the context window is too large for your laptop's memory and/or Ollama's default configuration.

This is a fundamental limitation that I'm not sure how to overcome at the moment. As LLMs get more efficient and laptops get more powerful, this should become less of an issue over time.
