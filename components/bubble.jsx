import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Inline avatar used for assistant messages (and the typing indicator). */
export const AssistantAvatar = () => (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/25 to-teal-500/15 ring-1 ring-inset ring-emerald-300/30">
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-emerald-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.4 15.2 9.7l-1.2 3.8h-4L8.8 9.7 12 7.4Z" />
            <path d="M12 3v4.4M3.3 9.4l5.5.3M20.7 9.4l-5.5.3M10 13.5l-1.8 5.3M14 13.5l1.8 5.3" />
        </svg>
    </div>
);

const UserAvatar = () => (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-inset ring-white/10">
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-slate-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
        </svg>
    </div>
);

/** Markdown styling for assistant replies. */
const proseClasses = [
    "prose prose-sm sm:prose-base prose-invert max-w-none",
    "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-white",
    "prose-p:my-2 prose-p:leading-relaxed prose-p:text-slate-200",
    "prose-strong:font-semibold prose-strong:text-emerald-200",
    "prose-em:text-slate-200",
    "prose-a:text-emerald-300 prose-a:no-underline hover:prose-a:underline",
    "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-li:marker:text-emerald-400/70",
    "prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5",
    "prose-code:text-[0.85em] prose-code:font-medium prose-code:text-emerald-200",
    "prose-code:before:content-none prose-code:after:content-none",
    "prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-slate-950/80",
    "prose-blockquote:border-l-emerald-400/60 prose-blockquote:text-slate-300 prose-blockquote:not-italic",
    "prose-hr:border-white/10",
    "prose-table:text-sm prose-th:text-emerald-200 prose-td:border-white/10",
    "prose-img:rounded-xl",
].join(" ");

const Bubble = ({ message }) => {
    const { role, content } = message;
    const isUser = role === "user";

    return (
        <div
            className={`flex w-full animate-fade-up items-start gap-3 ${
                isUser ? "flex-row-reverse" : ""
            }`}
        >
            {isUser ? <UserAvatar /> : <AssistantAvatar />}

            <div className="max-w-[85%] sm:max-w-[80%]">
                {isUser ? (
                    <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-lg shadow-emerald-950/40">
                        <p className="whitespace-pre-wrap break-words">
                            {content}
                        </p>
                    </div>
                ) : (
                    <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-3 shadow-lg shadow-slate-950/40 backdrop-blur-sm">
                        <div className={proseClasses}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/** Three-dot "assistant is thinking" bubble. */
export const TypingIndicator = () => (
    <div className="flex animate-fade-in items-start gap-3">
        <AssistantAvatar />
        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-3.5">
            {[0, 1, 2].map((index) => (
                <span
                    key={index}
                    className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-emerald-300"
                    style={{ animationDelay: `${index * 0.15}s` }}
                />
            ))}
        </div>
    </div>
);

export default Bubble;
