import React from "react";
import { marked } from "marked";
import { Download, RefreshCw } from "lucide-react";

interface ReportViewProps {
	markdown: string;
	onReset: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ markdown, onReset }) => {
	const htmlContent = marked(markdown);

	return (
		<div className="max-w-4xl mx-auto w-full p-4 md:p-8 animate-in fade-in duration-500">
			<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white">
					<h1 className="text-3xl font-bold mb-2">人格画像分析报告</h1>
					<p className="opacity-90">基于深度访谈生成的个性化洞察</p>
				</div>

				{/* Content */}
				<div className="p-8 prose prose-zinc dark:prose-invert max-w-none">
					<div dangerouslySetInnerHTML={{ __html: htmlContent }} />
				</div>

				{/* Footer actions */}
				<div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center">
					<button onClick={onReset} className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
						<RefreshCw size={20} />
						开始新的访谈
					</button>

					<button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity font-medium">
						<Download size={20} />
						保存报告 (PDF)
					</button>
				</div>
			</div>
		</div>
	);
};
