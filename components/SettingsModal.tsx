import React, { useState } from "react";
import { AppSettings, DEFAULT_SETTINGS, OLLAMA_DEFAULT_SETTINGS } from "@/lib/types";
import { X, Settings as SettingsIcon, Save } from "lucide-react";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentSettings: AppSettings;
	onSave: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
	const [settings, setSettings] = useState<AppSettings>(currentSettings);

	if (!isOpen) return null;

	const handleProviderChange = (provider: "openai" | "ollama") => {
		if (provider === "openai") {
			setSettings({ ...DEFAULT_SETTINGS, apiKey: settings.apiKey });
		} else {
			setSettings(OLLAMA_DEFAULT_SETTINGS);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
				{/* Header */}
				<div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
					<h2 className="text-lg font-semibold flex items-center gap-2">
						<SettingsIcon size={20} />
						模型设置
					</h2>
					<button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
						<X size={20} />
					</button>
				</div>

				{/* Body */}
				<div className="p-6 space-y-6 overflow-y-auto">
					{/* Mode Selection */}
					<div className="space-y-3">
						<label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">AI 模式</label>
						<div className="grid grid-cols-2 gap-3">
							<button onClick={() => handleProviderChange("openai")} className={`p-3 rounded-lg border text-sm font-medium transition-all ${settings.provider === "openai" ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"}`}>
								OpenAI (Remote)
							</button>
							<button onClick={() => handleProviderChange("ollama")} className={`p-3 rounded-lg border text-sm font-medium transition-all ${settings.provider === "ollama" ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"}`}>
								Ollama (Local)
							</button>
						</div>
					</div>

					{/* Config Fields */}
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">API Base URL</label>
							<input
								type="text"
								value={settings.apiUrl}
								onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
								className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
								placeholder={settings.provider === "openai" ? "https://api.openai.com/v1" : "http://localhost:11434/api/generate"}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Model Name</label>
							<input type="text" value={settings.modelName} onChange={(e) => setSettings({ ...settings, modelName: e.target.value })} className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder={settings.provider === "openai" ? "gpt-4o" : "llama3"} />
						</div>

						{settings.provider === "openai" && (
							<div className="space-y-2">
								<label className="text-sm font-medium">API Key</label>
								<input type="password" value={settings.apiKey} onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })} className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="sk-..." />
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-3">
					<button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
						取消
					</button>
					<button
						onClick={() => {
							onSave(settings);
							onClose();
						}}
						className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
						<Save size={16} />
						保存配置
					</button>
				</div>
			</div>
		</div>
	);
};
