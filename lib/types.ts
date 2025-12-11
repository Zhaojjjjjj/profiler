export type Role = "user" | "assistant" | "system";

export interface Message {
	role: Role;
	content: string;
	timestamp: number;
}

export type APIProvider = "openai" | "ollama";

export interface AppSettings {
	provider: APIProvider;
	apiUrl: string;
	apiKey: string;
	modelName: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
	provider: "openai",
	apiUrl: "https://api.openai.com/v1",
	apiKey: "",
	modelName: "gpt-4o",
};

export const OLLAMA_DEFAULT_SETTINGS: AppSettings = {
	provider: "ollama",
	apiUrl: "http://localhost:11434/api/generate",
	apiKey: "ollama", // Not usually needed but keeps interface consistent
	modelName: "llama3",
};
