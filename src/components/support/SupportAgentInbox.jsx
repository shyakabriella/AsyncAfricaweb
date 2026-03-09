import { useEffect, useMemo, useRef, useState } from "react";
import echo from "../../lib/echo";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function dedupeMessages(list) {
  const map = new Map();
  list.forEach((item) => map.set(item.id, item));
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export default function SupportAgentInbox({ authToken }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const channelRef = useRef(null);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    }),
    [authToken]
  );

  useEffect(() => {
    fetchConversations();
    setPresence(true);

    const listTimer = setInterval(fetchConversations, 5000);
    const presenceTimer = setInterval(() => setPresence(true), 20000);

    return () => {
      clearInterval(listTimer);
      clearInterval(presenceTimer);
      setPresence(false);
      if (channelRef.current) {
        echo.leave(channelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeConversation?.public_token) return;

    const channelName = `chat.conversation.${activeConversation.public_token}`;

    if (channelRef.current) {
      echo.leave(channelRef.current);
    }

    channelRef.current = channelName;

    echo.channel(channelName).listen(".chat.message.created", (event) => {
      setMessages((prev) => dedupeMessages([...prev, event]));
      fetchConversations();
    });

    return () => {
      echo.leave(channelName);
    };
  }, [activeConversation?.public_token]);

  async function setPresence(isOnline) {
    try {
      await fetch(`${API_BASE_URL}/support-chat/agent/presence`, {
        method: "POST",
        headers,
        body: JSON.stringify({ is_online: isOnline }),
      });
    } catch (error) {
      console.error("Presence update failed", error);
    }
  }

  async function fetchConversations() {
    try {
      const res = await fetch(`${API_BASE_URL}/support-chat/agent/conversations`, {
        headers,
      });
      const data = await res.json();
      setConversations(data.data || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function openConversation(conversationId) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/support-chat/agent/conversations/${conversationId}`,
        { headers }
      );
      const data = await res.json();
      setActiveConversation(data.conversation);
      setMessages(data.messages || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function takeOver() {
    if (!activeConversation) return;

    await fetch(
      `${API_BASE_URL}/support-chat/agent/conversations/${activeConversation.id}/take-over`,
      {
        method: "POST",
        headers,
      }
    );

    openConversation(activeConversation.id);
    fetchConversations();
  }

  async function sendReply(e) {
    e.preventDefault();
    if (!reply.trim() || !activeConversation) return;

    try {
      await fetch(
        `${API_BASE_URL}/support-chat/agent/conversations/${activeConversation.id}/message`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ message: reply }),
        }
      );

      setReply("");
      fetchConversations();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4 rounded-2xl border bg-white">
        <div className="border-b p-4 font-semibold">Open Conversations</div>
        <div className="max-h-[600px] overflow-y-auto">
          {conversations.map((item) => (
            <button
              key={item.id}
              onClick={() => openConversation(item.id)}
              className="block w-full border-b p-4 text-left hover:bg-gray-50"
            >
              <div className="font-medium">
                {item.guest_name || item.guest_email || `Visitor #${item.id}`}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {item.assigned_agent_name
                  ? `Assigned to ${item.assigned_agent_name}`
                  : "Unassigned"}
              </div>
              <div className="mt-2 text-sm text-gray-700">
                {item.latest_message?.message || "No messages yet"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-8 rounded-2xl border bg-white">
        {!activeConversation ? (
          <div className="p-8 text-gray-500">Select a conversation.</div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <div className="font-semibold">
                  {activeConversation.guest_name ||
                    activeConversation.guest_email ||
                    `Visitor #${activeConversation.id}`}
                </div>
                <div className="text-xs text-gray-500">
                  {activeConversation.bot_enabled ? "Bot active" : "Human handling"}
                </div>
              </div>

              <button
                onClick={takeOver}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
              >
                Take Over
              </button>
            </div>

            <div className="h-[480px] space-y-3 overflow-y-auto bg-gray-50 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_type === "agent" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                      msg.sender_type === "agent"
                        ? "bg-blue-600 text-white"
                        : "border bg-white text-gray-800"
                    }`}
                  >
                    <div className="mb-1 text-[11px] font-semibold opacity-70">
                      {msg.sender_type}
                    </div>
                    <div>{msg.message}</div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendReply} className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply to customer..."
                  className="flex-1 rounded-xl border px-3 py-2"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-white"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}