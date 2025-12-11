import { AppSettings, Message } from "./types";
import { generateNextQuestionPrompt, generateReportPrompt } from "./prompts";

export async function callAI(settings: AppSettings, messages: Message[], mode: "interview" | "report"): Promise<string> {
	const prompt = mode === "interview" ? generateNextQuestionPrompt(messages) : generateReportPrompt(messages);

	if (settings.provider === "openai") {
		return callOpenAI(settings, prompt);
	} else {
		return callOllama(settings, prompt);
	}
}

async function callOpenAI(settings: AppSettings, prompt: string): Promise<string> {
	// OpenAI typically uses /v1/chat/completions
	const endpoint = settings.apiUrl.endsWith("/chat/completions") ? settings.apiUrl : `${settings.apiUrl.replace(/\/+$/, "")}/chat/completions`;

	try {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${settings.apiKey}`,
			},
			body: JSON.stringify({
				model: settings.modelName,
				messages: [
					{ role: "user", content: prompt }, // For simplicity, we wrap the whole context in one user prompt or system + user
				],
				temperature: 0.7,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
		}

		const data = await response.json();
		return data.choices[0].message.content.trim();
	} catch (err: any) {
		throw new Error(err.message || "Failed to fetch from OpenAI");
	}
}

async function callOllama(settings: AppSettings, prompt: string): Promise<string> {
	// Ollama generate endpoint
	// Supports streaming usually, but we'll do non-streaming for simplicity unless requested
	try {
		const response = await fetch(settings.apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: settings.modelName,
				prompt: prompt,
				stream: false,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Ollama API Error: ${response.status} - ${error}`);
		}

		const data = await response.json();
		return data.response.trim();
	} catch (err: any) {
		throw new Error(err.message || "Failed to fetch from Ollama");
	}
}
