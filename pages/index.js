import logo from "@/assets/logo.png";
import Bubble, { TypingIndicator } from "@/components/bubble";
import PromptSuggestionRow from "@/components/promptSuggestionRow";
import { useChat } from "ai/react";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Home() {
    const {
        append,
        isLoading,
        messages,
        input,
        handleInputChange,
        handleSubmit,
        stop,
        error,
    } = useChat();

    const bottomRef = useRef(null);
    const formRef = useRef(null);
    const textareaRef = useRef(null);

    const hasMessages = messages.length > 0;

    // Keep the newest message in view.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, isLoading]);

    // Grow the composer with its content, up to a max height.
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
    }, [input]);

    const onPromptClick = (suggestion) => {
        append({
            id: crypto.randomUUID(),
            content: suggestion,
            role: "user",
        });
    };

    // Enter sends, Shift+Enter adds a newline.
    const onKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!isLoading && input.trim()) formRef.current?.requestSubmit();
        }
    };

    return (
        <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-slate-950">
            {/* Ambient background glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <div className="absolute -top-48 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[130px]" />
                <div className="absolute -bottom-40 -right-24 h-[26rem] w-[26rem] rounded-full bg-teal-500/10 blur-[130px]" />
                <div className="absolute -left-32 top-1/3 h-[22rem] w-[22rem] rounded-full bg-sky-500/[0.07] blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 shrink-0 border-b border-white/[0.06] bg-slate-950/70 backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3.5">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                        <Image
                            src={logo}
                            alt="FootballGPT logo"
                            fill
                            sizes="40px"
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-[15px] font-semibold tracking-tight text-white">
                            Football
                            <span className="text-emerald-400">GPT</span>
                        </h1>
                        <p className="truncate text-xs text-slate-500">
                            Retrieval-augmented answers about the beautiful game
                        </p>
                    </div>
                </div>
            </header>

            {/* Conversation */}
            <main className="scrollbar-slim relative z-10 flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-3xl px-4 py-6">
                    {!hasMessages ? (
                        <div className="flex flex-col items-center pt-6 sm:pt-14">
                            <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-[2.6rem] sm:leading-tight">
                                Ask anything about
                                <span className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                    the beautiful game
                                </span>
                            </h2>

                            <p className="mt-4 max-w-lg text-center text-sm leading-relaxed text-slate-400 sm:text-base">
                                Live facts from Wikipedia, FIFA and the biggest
                                football sites — retrieved on demand and
                                answered in plain language.
                            </p>

                            <div className="mt-10 w-full max-w-2xl">
                                <PromptSuggestionRow
                                    onPromptClick={onPromptClick}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {messages.map((message, index) => (
                                <Bubble
                                    key={message.id ?? `message-${index}`}
                                    message={message}
                                />
                            ))}

                            {isLoading && <TypingIndicator />}

                            {error && (
                                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    Something went wrong while generating a
                                    response. Please try again.
                                </div>
                            )}
                        </div>
                    )}

                    <div ref={bottomRef} className="h-1" />
                </div>
            </main>

            {/* Composer */}
            <footer className="relative z-10 shrink-0 border-t border-white/[0.06] bg-slate-950/70 backdrop-blur-xl">
                <div className="mx-auto w-full max-w-3xl px-4 py-3.5">
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 shadow-lg shadow-slate-950/50 transition-colors focus-within:border-emerald-400/50 focus-within:bg-white/[0.06]"
                    >
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={onKeyDown}
                            placeholder="Talk about football with me…"
                            aria-label="Message"
                            className="scrollbar-slim max-h-[10.5rem] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none"
                        />

                        {isLoading ? (
                            <button
                                type="button"
                                onClick={stop}
                                aria-label="Stop generating"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="7"
                                        y="7"
                                        width="10"
                                        height="10"
                                        rx="2"
                                    />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                aria-label="Send message"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/40 transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            </button>
                        )}
                    </form>

                    <p className="mt-2 text-center text-[11px] text-slate-600">
                        FootballGPT can make mistakes. Verify important facts.
                    </p>
                </div>
            </footer>
        </div>
    );
}
