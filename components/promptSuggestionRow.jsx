const suggestions = [
  "Who has won the latest Ballon d'Or?",
  "Who is the top scorer in the Premier League?",
  "Who is the best player in the world?",
  "Which team has won the most Champions League titles?",
  "Which team has won the most Premier League titles?",
];

const PromptSuggestionRow = ({ onPromptClick }) => {
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className=" rounded-full lg:px-4 lg:py-3 p-2 border border-primary"
          onClick={() => onPromptClick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default PromptSuggestionRow;
