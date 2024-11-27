const Bubble = ({ message }) => {
  const { role, content } = message;

  return (
    <div className={`chat ${role === "user" ? "chat-end" : "chat-start"} `}>
      <div
        className={`chat-bubble text-white ${
          role === "user" ? "" : "chat-bubble-primary"
        }`}
      >
        {content}
      </div>
    </div>
  );
};

export default Bubble;
