import React from "react";
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatBubbleProps {
	message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
	const isUser = message.role === "user";

	return (
		<div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
			<div className={cn("flex max-w-[80%] md:max-w-[70%] gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
				<div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", isUser ? "bg-blue-600 text-white" : "bg-emerald-600 text-white")}>{isUser ? <User size={18} /> : <Bot size={18} />}</div>

				<div className={cn("p-4 rounded-2xl text-sm md:text-base shadow-sm", isUser ? "bg-blue-600 text-white rounded-tr-none" : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-tl-none")}>{message.content}</div>
			</div>
		</div>
	);
};
