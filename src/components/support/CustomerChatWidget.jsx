import { useEffect, useMemo, useRef, useState } from "react";
import { Headset, MessageCircle, PhoneCall, X } from "lucide-react";
import echo from "../../lib/echo";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const STORAGE_KEY = "support_chat_token";
const SUPPORT_PHONE_PATH =
  import.meta.env.VITE_SUPPORT_PHONE_PATH || "/support/phone";

function dedupeMessages(list) {
  const map = new Map();
  list.forEach((item) => map.set(item.id, item));
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export default function CustomerChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [supportOnline, setSupportOnline] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const channelRef = useRef(null);
  const initializedRef = useRef(false);

  const token = useMemo(() => localStorage.getItem(STORAGE_KEY), []);

  useEffect(() => {
    checkSupportStatus();
  }, []);

  useEffect(() => {
    if (!token || initializedRef.current) return;
    initializedRef.current = true;
    loadExistingConversation(token);
  }, [token]);

  useEffect(() => {
    if (!conversation?.public_token) return;

    const channelName = `chat.conversation.${conversation.public_token}`;

    if (channelRef.current) {
      echo.leave(channelRef.current);
    }

    channelRef.current = channelName;

    echo.channel(channelName).listen(".chat.message.created", (event) => {
      setMessages((prev) => dedupeMessages([...prev, event]));
    });

    return () => {
      echo.leave(channelName);
    };
  }, [conversation?.public_token]);

  async function checkSupportStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/support-chat/status`);
      const data = await res.json();
      setSupportOnline(Boolean(data?.online));
    } catch (error) {
      console.error("Failed to check support status", error);
    }
  }

  async function createConversation() {
    const res = await fetch(`${API_BASE_URL}/support-chat/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        guest_name: guestName || null,
        guest_email: guestEmail || null,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create support session");
    }

    const data = await res.json();
    localStorage.setItem(STORAGE_KEY, data.conversation.public_token);
    setConversation(data.conversation);
    setMessages(data.messages || []);
    return data.conversation;
  }

  async function loadExistingConversation(existingToken) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/support-chat/session/${existingToken}`,
        {
          headers: { Accept: "application/json" },
        }
      );

      if (!res.ok) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const data = await res.json();
      setConversation(data.conversation);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to load existing support session", error);
    }
  }

  function handleOpenPhoneSupport() {
    window.location.href = SUPPORT_PHONE_PATH;
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);

    try {
      let currentConversation = conversation;

      if (!currentConversation) {
        currentConversation = await createConversation();
      }

      const res = await fetch(
        `${API_BASE_URL}/support-chat/session/${currentConversation.public_token}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ message: input }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data = await res.json();

      setConversation(data.conversation);
      setMessages((prev) =>
        dedupeMessages([
          ...prev,
          ...(data.customer_message ? [data.customer_message] : []),
          ...(data.bot_reply ? [data.bot_reply] : []),
        ])
      );

      setInput("");
      checkSupportStatus();
    } catch (error) {
      console.error(error);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenPhoneSupport}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700"
            title="Call Center Support"
            aria-label="Open call center support"
          >
            <Headset className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white shadow-lg transition hover:bg-blue-700"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Chat with us</span>
          </button>
        </div>
      ) : (
        <div className="w-[350px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <h3 className="font-semibold">Customer Support</h3>
              <p className="text-xs text-gray-500">
                {supportOnline
                  ? "Agent online now"
                  : "Agent offline — bot will help first"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenPhoneSupport}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition hover:bg-emerald-200"
                title="Open phone support"
                aria-label="Open phone support"
              >
                <PhoneCall className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                title="Close"
                aria-label="Close support widget"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Headset className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">
                  Call Center Support
                </h4>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Need faster help? Open the support phone page and connect
                  with customer support directly without login.
                </p>

                <button
                  type="button"
                  onClick={handleOpenPhoneSupport}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  <PhoneCall className="h-4 w-4" />
                  Open Phone Support
                </button>
              </div>
            </div>
          </div>

          {!conversation && (
            <div className="space-y-3 border-b border-gray-100 p-4">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              />
              <input
                type="email"
                placeholder="Your email (optional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              />
            </div>
          )}

          <div className="h-[360px] space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-600">
                Hello 👋 Send us your message and we will help you.
              </div>
            ) : (
              messages.map((msg) => {
                const isCustomer = msg.sender_type === "customer";
                const isBot = msg.sender_type === "bot";
                const label = isCustomer ? "You" : isBot ? "Bot" : "Agent";

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isCustomer ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        isCustomer
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 bg-white text-gray-800"
                      }`}
                    >
                      <div className="mb-1 text-[11px] font-semibold opacity-70">
                        {label}
                      </div>
                      <div>{msg.message}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSend} className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}