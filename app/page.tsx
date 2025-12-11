"use client";

import React, { useState, useEffect, useRef } from "react";
import { Message, AppSettings, DEFAULT_SETTINGS } from "@/lib/types";
import { callAI } from "@/lib/ai-service";
import { ChatBubble } from "@/components/ChatBubble";
import { SettingsModal } from "@/components/SettingsModal";
import { ReportView } from "@/components/ReportView";
import { Settings as SettingsIcon, Send, Sparkles, Loader2, Play, Bot } from "lucide-react";

export default function Home() {
	// State
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
	const [turnCount, setTurnCount] = useState(0);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Auto-scroll
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isLoading]);

	// Load settings from local storage
	useEffect(() => {
		const saved = localStorage.getItem("profiler_settings");
		if (saved) {
			try {
				setSettings(JSON.parse(saved));
			} catch (e) {
				console.error("Failed to load settings", e);
			}
		}
	}, []);

	const handleSaveSettings = (newSettings: AppSettings) => {
		setSettings(newSettings);
		localStorage.setItem("profiler_settings", JSON.stringify(newSettings));
	};

	// Start interview
	const startInterview = async () => {
		if (isLoading) return;
		setMessages([]);
		setReportMarkdown(null);
		setTurnCount(0);
		setIsLoading(true);

		// Initial greeting / question
		// We can just ask the AI to start, or hardcode the first one.
		// Hardcoding is faster and more reliable for the first hook.
		const initialMessage: Message = {
			role: "assistant",
			content: "你好，我是你的专属人格画像师。接下来的对话中，我会问你一些关于价值观、选择和经历的问题。请放松，真实地回答。\n\n让我们开始吧：你觉得自己目前人生中最重要的驱动力是什么？",
			timestamp: Date.now(),
		};

		// Simulate AI thinking time slightly for effect
		setTimeout(() => {
			setMessages([initialMessage]);
			setIsLoading(false);
		}, 600);
	};

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;

		const userMsg: Message = {
			role: "user",
			content: input.trim(),
			timestamp: Date.now(),
		};

		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsLoading(true);
		setTurnCount((prev) => prev + 1);

		try {
			// Get AI response
			const responseText = await callAI(settings, [...messages, userMsg], "interview");

			const aiMsg: Message = {
				role: "assistant",
				content: responseText,
				timestamp: Date.now(),
			};

			setMessages((prev) => [...prev, aiMsg]);
		} catch (error: any) {
			// Error handling
			const errorMsg: Message = {
				role: "system", // Use system or assistant to show error
				content: `❌ 出错了: ${error.message}. 请检查设置后重试。`,
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, errorMsg]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGenerateReport = async () => {
		if (isLoading) return;
		setIsLoading(true);
		try {
			const report = await callAI(settings, messages, "report");
			setReportMarkdown(report);
		} catch (error: any) {
			alert(`生成报告失败: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	// Render
	if (reportMarkdown) {
		return <ReportView markdown={reportMarkdown} onReset={() => setReportMarkdown(null)} />;
	}

	return (
		<main className="flex flex-col h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
			{/* Header */}
			<header className="flex-none h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
				<div className="flex items-center gap-3">
					<div className="bg-zinc-900 dark:bg-white text-white dark:text-black p-2 rounded-lg">
						<Sparkles size={20} />
					</div>
					<h1 className="font-bold text-lg tracking-tight">AI 人格画像系统</h1>
				</div>
				<div className="flex items-center gap-2">
					{messages.length > 0 && turnCount >= 8 && (
						<button onClick={handleGenerateReport} disabled={isLoading} className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
							{isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
							生成画像报告
						</button>
					)}
					<button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
						<SettingsIcon size={20} />
					</button>
				</div>
			</header>

			{/* Main Content */}
			<div className="flex-1 overflow-hidden relative flex flex-col max-w-5xl mx-auto w-full">
				{messages.length === 0 ? (
					// Welcome Screen
					<div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
						<div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
							<Sparkles size={40} className="text-zinc-400" />
						</div>
						<h2 className="text-2xl font-bold mb-4">探索真实的自我</h2>
						<p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8 leading-relaxed">通过深度对话，AI 将分析你的性格特质、潜意识动机和行为模式。准备好开始这段探索之旅了吗？</p>
						<button onClick={startInterview} className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white transition-all duration-200 bg-zinc-900 dark:bg-zinc-100 dark:text-black rounded-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900">
							开始访谈
							<Play size={18} className="ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" />
						</button>
					</div>
				) : (
					// Chat Screen
					<>
						<div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
							{messages.map((msg, idx) => (
								<ChatBubble key={idx} message={msg} />
							))}

							{isLoading && (
								<div className="flex justify-start w-full mb-6 animate-pulse">
									<div className="flex max-w-[80%] gap-3 flex-row">
										<div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
											<Bot size={18} />
										</div>
										<div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
											<Loader2 className="animate-spin text-zinc-400" size={16} />
											<span className="text-sm text-zinc-500">思考中...</span>
										</div>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Input Area */}
						<div className="p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
							{/* Report Gen Button Mobile */}
							{turnCount >= 8 && (
								<div className="md:hidden mb-4 flex justify-center">
									<button onClick={handleGenerateReport} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
										{isLoading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
										生成画像报告
									</button>
								</div>
							)}

							<div className="max-w-3xl mx-auto relative flex items-center gap-2">
								<input
									type="text"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
									placeholder={isLoading ? "请等待 AI 回复..." : "输入你的回答..."}
									disabled={isLoading}
									className="flex-1 p-4 pr-12 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-sm"
									autoFocus
								/>
								<button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute right-2 p-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 transition-all">
									<Send size={18} />
								</button>
							</div>
							<p className="text-center text-xs text-zinc-400 mt-3">{turnCount < 8 ? `再回答 ${8 - turnCount} 个问题后可生成报告` : "已收集足够信息，随时可以生成报告"}</p>
						</div>
					</>
				)}
			</div>

			<SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentSettings={settings} onSave={handleSaveSettings} />
		</main>
	);
}
