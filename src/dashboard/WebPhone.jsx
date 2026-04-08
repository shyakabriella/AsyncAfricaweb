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

const SIP_DOMAIN =
  import.meta.env.VITE_SIP_DOMAIN || "pbx.asyncafrica.com";

const SIP_AOR =
  import.meta.env.VITE_SIP_AOR || `sip:2001@${SIP_DOMAIN}`;

const SIP_USERNAME =
  import.meta.env.VITE_SIP_USERNAME || "2001";

const SIP_PASSWORD =
  import.meta.env.VITE_SIP_PASSWORD || "2001";

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
    return "Microphone permission was denied on this phone/browser.";
  }

  if (name === "NotFoundError") {
    return "No microphone was found on this phone.";
  }

  if (name === "NotReadableError") {
    return "The microphone is busy or could not be opened.";
  }

  if (name === "OverconstrainedError") {
    return "The requested audio settings are not supported on this phone.";
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

export default function WebPhone() {
  const [destination, setDestination] = useState(CALL_CENTER_EXTENSION);
  const [status, setStatus] = useState("Connecting...");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [hasIncomingCall, setHasIncomingCall] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [callSeconds, setCallSeconds] = useState(0);

  const simpleUserRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const setupPhone = async () => {
      try {
        setErrorMessage("");
        setStatus("Connecting...");

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
            setStatus("Incoming call");
          },

          onCallAnswered: async () => {
            if (!isMounted) return;
            setHasIncomingCall(false);
            setIsCalling(false);
            setIsInCall(true);
            setCallSeconds(0);
            setStatus("Call active");

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
            setStatus("Call ended");
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
        setStatus("Connection failed");
        setErrorMessage(
          "Could not connect the web phone. Check WSS, SIP account, and Asterisk WebRTC settings."
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
  };

  const handleBackspace = () => {
    setDestination((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setDestination("");
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
      setErrorMessage("Please enter an extension or phone number.");
      return;
    }

    try {
      setErrorMessage("");
      setIsCalling(true);
      setCallSeconds(0);
      setStatus("Preparing microphone...");

      const tempStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      tempStream.getTracks().forEach((track) => track.stop());

      setStatus(`Calling ${cleanedDestination}...`);
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
      setStatus("Call failed");
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
      setStatus("Call active");

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
      setStatus("Hung up");
    } catch (error) {
      console.error("Hangup failed:", error);
      setStatus("Hangup failed");
      setErrorMessage(getReadableError(error));
    }
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="flex h-full flex-col rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Phone className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Web Phone</h2>

                {isRegistered ? (
                  <span
                    className="inline-flex items-center"
                    title="Connected"
                    aria-label="Connected"
                  >
                    <Circle className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                  </span>
                ) : null}
              </div>

              <p className="text-sm text-slate-600">
                {isInCall ? "In call" : status}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Time
            </p>
            <p className="text-base font-bold text-slate-900">
              {formatDuration(callSeconds)}
            </p>
          </div>
        </div>

        {hasIncomingCall ? (
          <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <PhoneIncoming className="h-5 w-5" />
              <span className="text-sm font-semibold">Incoming call</span>
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

        <div className="mb-3">
          <label
            htmlFor="destination"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Extension or Number
          </label>

          <input
            id="destination"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            enterKeyHint="go"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCall();
              }
            }}
            placeholder="1002"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-3xl font-semibold tracking-[0.16em] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSetCallCenter}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <Headset className="h-4 w-4" />
              Call Center {CALL_CENTER_EXTENSION}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <Delete className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {DIAL_KEYS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => appendToDestination(item.value)}
              className="flex h-12 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition hover:bg-slate-100 active:scale-[0.98]"
            >
              <span className="text-lg font-semibold leading-none">
                {item.value}
              </span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.18em] text-slate-400">
                {item.letters || "\u00A0"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCall}
            disabled={!isRegistered || isCalling || isInCall}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PhoneCall className="h-4 w-4" />
            Call
          </button>

          <button
            type="button"
            onClick={handleHangup}
            disabled={!isCalling && !isInCall && !hasIncomingCall}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PhoneOff className="h-4 w-4" />
            Hangup
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <audio ref={remoteAudioRef} autoPlay />
      </div>
    </div>
  );
}