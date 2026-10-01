const suggestions = [
    { icon: "🏆", label: "Who has won the latest Ballon d'Or?" },
    { icon: "⚽", label: "Who is the top scorer in the Premier League?" },
    { icon: "🌟", label: "Who is the best player in the world?" },
    {
        icon: "🇪🇺",
        label: "Which team has won the most Champions League titles?",
    },
    { icon: "🏴", label: "Which team has won the most Premier League titles?" },
];

const PromptSuggestionRow = ({ onPromptClick }) => {
    const isOdd = suggestions.length % 2 === 1;

    return (
        <div className="grid w-full gap-3 sm:grid-cols-2">
            {suggestions.map((suggestion, index) => {
                const isLastOdd = isOdd && index === suggestions.length - 1;

                return (
                    <button
                        key={suggestion.label}
                        type="button"
                        onClick={() => onPromptClick(suggestion.label)}
                        className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left text-sm text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.06] hover:text-white hover:shadow-lg hover:shadow-emerald-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
                            isLastOdd ? "sm:col-span-2" : ""
                        }`}
                    >
                        <span
                            className="text-lg leading-none"
                            aria-hidden="true"
                        >
                            {suggestion.icon}
                        </span>
                        <span className="flex-1">{suggestion.label}</span>
                        <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-300"
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
                );
            })}
        </div>
    );
};

export default PromptSuggestionRow;
