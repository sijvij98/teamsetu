"use client";

export default function ChatCta({ className = "btn btn-light btn-lg", children }) {
  const open = () => {
    const fab = document.querySelector(".chat-fab");
    if (fab) fab.click();
    else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };
  return (
    <button className={className} onClick={open}>
      {children || "Chat with Setu"}
    </button>
  );
}
