import { useEffect, useRef, useState } from "react";
import {
  Circle,
  Delete,
  Headset,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
} from "lucide-react";
import { SimpleUser } from "sip.js/lib/platform/web";

const SIP_WSS_URL =
  import.meta.env.VITE_SIP_WSS_URL || "wss://pbx.asyncafrica.com:8089/ws";

const SIP_DOMAIN = import.meta.env.VITE_SIP_DOMAIN || "pbx.asyncafrica.com";

const SIP_AOR = import.meta.env.VITE_SIP_AOR || `sip:2001@${SIP_DOMAIN}`;

const SIP_USERNAME = import.meta.env.VITE_SIP_USERNAME || "2001";

const SIP_PASSWORD = import.meta.env.VITE_SIP_PASSWORD || "2001";

const CALL_CENTER_EXTENSION = "1002";

const DIAL_KEYS = [
  { value: "1", letters: "" },
  { value: "2", letters: "ABC" },
  { value: "3", letters: "DEF" },
  { value: "4", letters: "GHI" },
  { value: "5", letters: "JKL" },
  { value: "6", letters: "MNO" },
  { value: "7", letters: "PQRS" },
  { value: "8", letters: "TUV" },
  { value: "9", letters: "WXYZ" },
  { value: "*", letters: "" },
  { value: "0", letters: "+" },
  { value: "#", letters: "" },
];

function sanitizeDestination(value) {
  return String(value || "")
    .replace(/[^\d+#*A-Za-z._-]/g, "")
    .trim();
}

function getReadableError(error) {
  const name = error?.name || "UnknownError";
  const message = error?.message || "Unknown browser/media error";

  if (name === "NotAllowedError") {
    return "Microphone permission was denied.";
  }

  if (name === "NotFoundError") {
    return "No microphone was found.";
  }

  if (name === "NotReadableError") {
    return "The microphone is busy or could not be opened.";
  }

  if (name === "OverconstrainedError") {
    return "The requested audio settings are not supported.";
  }

  if (name === "SecurityError") {
    return "Browser security blocked microphone access.";
  }

  return `${name}: ${message}`;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function formatClock(date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WebPhone() {
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("Connecting");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [hasIncomingCall, setHasIncomingCall] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [callSeconds, setCallSeconds] = useState(0);
  const [clock, setClock] = useState(() => formatClock(new Date()));

  const simpleUserRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClock(formatClock(new Date()));
    }, 1000 * 20);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const setupPhone = async () => {
      try {
        setErrorMessage("");
        setStatus("Connecting");

        const simpleUser = new SimpleUser(SIP_WSS_URL, {
          aor: SIP_AOR,
          media: {
            constraints: {
              audio: true,
              video: false,
            },
            remote: {
              audio: remoteAudioRef.current,
            },
          },
          userAgentOptions: {
            authorizationUsername: SIP_USERNAME,
            authorizationPassword: SIP_PASSWORD,
          },
        });

        simpleUser.delegate = {
          onCallReceived: async () => {
            if (!isMounted) return;
            setHasIncomingCall(true);
            setIsCalling(false);
            setStatus("Incoming");
          },

          onCallAnswered: async () => {
            if (!isMounted) return;
            setHasIncomingCall(false);
            setIsCalling(false);
            setIsInCall(true);
            setCallSeconds(0);
            setStatus("Active");

            try {
              await remoteAudioRef.current?.play?.();
            } catch (e) {
              console.warn("Remote audio play warning:", e);
            }
          },

          onCallHangup: async () => {
            if (!isMounted) return;
            setHasIncomingCall(false);
            setIsCalling(false);
            setIsInCall(false);
            setCallSeconds(0);
            setStatus("Ended");
          },
        };

        await simpleUser.connect();
        await simpleUser.register();

        if (!isMounted) return;

        simpleUserRef.current = simpleUser;
        setIsRegistered(true);
        setStatus("Ready");
      } catch (error) {
        console.error("Web phone setup failed:", error);

        if (!isMounted) return;

        setIsRegistered(false);
        setStatus("Offline");
        setErrorMessage(
          "Could not connect the phone. Check WSS, SIP account, and Asterisk WebRTC settings."
        );
      }
    };

    setupPhone();

    return () => {
      isMounted = false;

      const simpleUser = simpleUserRef.current;

      if (simpleUser) {
        Promise.resolve(simpleUser.unregister?.()).catch(() => {});
        Promise.resolve(simpleUser.disconnect?.()).catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!isInCall) return;

    const interval = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isInCall]);

  const appendToDestination = (value) => {
    setDestination((prev) => `${prev}${value}`);
    setErrorMessage("");
  };

  const handleBackspace = () => {
    setDestination((prev) => prev.slice(0, -1));
  };

  const handleSetCallCenter = () => {
    setDestination(CALL_CENTER_EXTENSION);
    setErrorMessage("");
  };

  const handleCall = async () => {
    const simpleUser = simpleUserRef.current;
    const cleanedDestination = sanitizeDestination(destination);

    if (!simpleUser) {
      setErrorMessage("Phone is not ready yet.");
      return;
    }

    if (!cleanedDestination) {
      setErrorMessage("Enter an extension or phone number.");
      return;
    }

    try {
      setErrorMessage("");
      setIsCalling(true);
      setCallSeconds(0);
      setStatus("Mic...");

      const tempStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      tempStream.getTracks().forEach((track) => track.stop());

      setStatus("Calling");
      await simpleUser.call(`sip:${cleanedDestination}@${SIP_DOMAIN}`);

      try {
        await remoteAudioRef.current?.play?.();
      } catch (e) {
        console.warn("Remote audio play warning after call:", e);
      }
    } catch (error) {
      console.error("Call failed:", error);
      setIsCalling(false);
      setIsInCall(false);
      setCallSeconds(0);
      setStatus("Failed");
      setErrorMessage(getReadableError(error));
    }
  };

  const handleAnswer = async () => {
    const simpleUser = simpleUserRef.current;

    if (!simpleUser) {
      setErrorMessage("Phone is not ready yet.");
      return;
    }

    try {
      setErrorMessage("");
      setCallSeconds(0);
      await simpleUser.answer();
      setHasIncomingCall(false);
      setIsInCall(true);
      setStatus("Active");

      try {
        await remoteAudioRef.current?.play?.();
      } catch (e) {
        console.warn("Remote audio play warning on answer:", e);
      }
    } catch (error) {
      console.error("Answer failed:", error);
      setStatus("Answer failed");
      setErrorMessage(getReadableError(error));
    }
  };

  const handleHangup = async () => {
    const simpleUser = simpleUserRef.current;

    if (!simpleUser) {
      setErrorMessage("Phone is not ready yet.");
      return;
    }

    try {
      setErrorMessage("");
      await simpleUser.hangup();
      setHasIncomingCall(false);
      setIsCalling(false);
      setIsInCall(false);
      setCallSeconds(0);
      setStatus("Ended");
    } catch (error) {
      console.error("Hangup failed:", error);
      setStatus("Hangup failed");
      setErrorMessage(getReadableError(error));
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-gradient-to-b from-white via-slate-50 to-slate-100 px-3 pb-3 pt-2">
      {/* status bar */}
      <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold text-slate-900">
        <span>{clock}</span>

        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center"
            title={isRegistered ? "Connected" : "Disconnected"}
            aria-label={isRegistered ? "Connected" : "Disconnected"}
          >
            <Circle
              className={`h-3.5 w-3.5 ${
                isRegistered
                  ? "fill-emerald-500 text-emerald-500"
                  : "fill-slate-300 text-slate-300"
              }`}
            />
          </span>

          <span className="h-2 w-2 rounded-full bg-slate-900" />
          <span className="h-2 w-2 rounded-full bg-slate-900" />
          <span className="rounded-md border border-slate-400 px-1 py-[1px] text-[9px] leading-none text-slate-700">
            100%
          </span>
        </div>
      </div>

      {/* incoming call */}
      {hasIncomingCall ? (
        <div className="mb-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <div className="mb-2 flex items-center justify-center gap-2 text-emerald-700">
            <PhoneIncoming className="h-4 w-4" />
            <span className="text-xs font-semibold">Incoming call</span>
          </div>

          <button
            type="button"
            onClick={handleAnswer}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Answer
          </button>
        </div>
      ) : null}

      {/* top display */}
      <div className="mb-3 flex min-h-[120px] flex-col items-center justify-center rounded-[26px] bg-white/90 px-4 text-center shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="inline-flex items-center"
            title={isRegistered ? "Connected" : "Disconnected"}
            aria-label={isRegistered ? "Connected" : "Disconnected"}
          >
            <Circle
              className={`h-3.5 w-3.5 ${
                isRegistered
                  ? "fill-emerald-500 text-emerald-500"
                  : "fill-slate-300 text-slate-300"
              }`}
            />
          </span>

          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {isInCall
              ? "In Call"
              : isCalling
              ? "Calling"
              : hasIncomingCall
              ? "Incoming"
              : "Dial Pad"}
          </span>
        </div>

        <div className="min-h-[44px] max-w-full break-all text-center text-[30px] font-semibold tracking-[0.14em] text-slate-900">
          {destination || "• • •"}
        </div>

        <div className="mt-2 text-sm font-medium text-slate-500">
          {isInCall ? formatDuration(callSeconds) : status}
        </div>
      </div>

      {/* quick actions */}
      <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={handleSetCallCenter}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          <Headset className="h-4 w-4" />
          Call Center
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
        >
          <Delete className="h-4 w-4" />
        </button>
      </div>

      {/* keypad */}
      <div className="grid grid-cols-3 gap-2.5">
        {DIAL_KEYS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => appendToDestination(item.value)}
            className="flex h-[58px] flex-col items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.97]"
          >
            <span className="text-[24px] font-medium leading-none">
              {item.value}
            </span>
            <span className="mt-1 text-[9px] uppercase tracking-[0.22em] text-slate-400">
              {item.letters || "\u00A0"}
            </span>
          </button>
        ))}
      </div>

      {/* bottom actions */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setDestination("")}
          className="inline-flex h-12 items-center justify-center rounded-full bg-slate-200 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-300"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={handleCall}
          disabled={!isRegistered || isCalling || isInCall}
          className="inline-flex h-14 w-full items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PhoneCall className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={handleHangup}
          disabled={!isCalling && !isInCall && !hasIncomingCall}
          className="inline-flex h-12 items-center justify-center rounded-full bg-red-600 px-4 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>

      {/* error */}
      {errorMessage ? (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-center text-[11px] leading-5 text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}