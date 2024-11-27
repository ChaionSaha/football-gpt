import Image from "next/image";
import { useEffect, useReducer, useRef, useState } from "react";
import logo from "@/assets/logo.png";
import { useChat } from "ai/react";
import Bubble from "@/components/bubble";
import PromptSuggestionRow from "@/components/promptSuggestionRow";

export default function Home() {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const [noMessages, setNoMessages] = useState(
    !messages || messages.length === 0
  );

  useEffect(() => {
    setNoMessages(!messages || messages.length === 0 ? true : false);
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onPromptClick = (suggestion) => {
    const msg = {
      id: crypto.randomUUID(),
      content: suggestion,
      role: "user",
    };
    append(msg);
  };
  const bottomRef = useRef(null);

  return (
    <div
      className=" relative"
      style={{
        background: "url('/bg-fbgpt.jpg')",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute w-full h-full bg-[rgba(255,255,255,0.95)]"></div>
      <div className="container w-[50%] mx-auto h-screen flex flex-col z-[100] ">
        <Image src={logo} alt="Logo" className="w-16 h-fit mx-auto my-5" />
        <section className="flex-grow flex flex-col overflow-y-auto max-h-[80dvh] chat-body">
          {noMessages ? (
            <div className="flex flex-col justify-center items-center flex-grow my-auto">
              <p className="text-2xl w-[90%] text-neutral text-center mb-10">
                Welcome Football Fans! Ask me anything about the fantastic topic
                of Football and I will come back with the most up-to-date
                answers. Hope you will enjoy!
              </p>
              {/* question suggestions */}
              <PromptSuggestionRow onPromptClick={onPromptClick} />
            </div>
          ) : (
            <div className="mt-auto">
              {/* here messages will appear */}
              {messages.length > 0 &&
                messages.map((message, index) => (
                  <Bubble key={`message-${index}`} message={message} />
                ))}
              {isLoading && (
                <div className="chat chat-start">
                  <div className="chat-bubble bg-primary ">
                    <span className="loading loading-dots loading-md bg-white"></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
        <div className="" ref={bottomRef}></div>
        <form
          onSubmit={handleSubmit}
          className="border border-primary flex items-stretch my-2 rounded-full "
        >
          <input
            type="text"
            placeholder="Talk about football with me..."
            className="input bg-transparent flex-grow focus:outline-none focus:border-0 input-lg"
            onChange={handleInputChange}
            value={input}
          />
          <button
            type="submit"
            className="btn btn-primary text-white h-full rounded-full btn-lg"
          >
            <i className="bi bi-send"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
