# AI Personality Profiler

An AI-based personality profiling system that conducts depth interviews to analyze personality traits, values, motivations, and behavioral tendencies.

## Features

-   **Deep Interview Chat**: AI dynamically asks follow-up questions based on your answers.
-   **Personality Report**: Generates a comprehensive markdown report after sufficient data collection.
-   **Dual AI Mode**: Supports both Remote (OpenAI) and Local (Ollama) AI models.
-   **Privacy Focused**: Pure frontend application, no backend storage.

## Getting Started

### Prerequisites

-   Node.js 18+
-   (Optional) [Ollama](https://ollama.com/) for local inference.

### Installation

1. Install dependencies:

    ```bash
    npm install
    ```

2. Run development server:

    ```bash
    npm run dev
    ```

3. Open [http://localhost:3000](http://localhost:3000)

## AI Setup

### Mode A: OpenAI (Remote)

1. Click the **Settings** (gear icon).
2. Select **OpenAI**.
3. Enter your API Key and Model Name (e.g., `gpt-4o`).

### Mode B: Ollama (Local)

1. Install Ollama and pull a model:
    ```bash
    ollama pull llama3
    ```
2. **Important**: You must allow CORS for Ollama to be accessed from the browser.
   Run Ollama with `OLLAMA_ORIGINS` environment variable:
    ```bash
    OLLAMA_ORIGINS="*" ollama serve
    ```
3. In the app Settings, select **Ollama**.
4. Set URL to `http://localhost:11434/api/generate` (default).

## Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **Markdown**: Marked
