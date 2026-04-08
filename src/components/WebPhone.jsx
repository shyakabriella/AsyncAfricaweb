import { useEffect, useRef, useState } from "react";
import { Phone, PhoneCall, PhoneIncoming, PhoneOff } from "lucide-react";
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

function sanitizeDestination(value) {
  return String(value || "").replace(/[^\d+#*A-Za-z._-]/g, "").trim();
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
    return "The requested audio device settings are not supported on this phone.";
  }

  if (name === "SecurityError") {
    return "Browser security blocked microphone access.";
  }

  return `${name}: ${message}`;
}

export default function WebPhone() {
  const [destination, setDestination] = useState("1002");
  const [status, setStatus] = useState("Connecting...");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [hasIncomingCall, setHasIncomingCall] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
            setStatus("Call ended");
          },
        };

        await simpleUser.connect();
        await simpleUser.register();

        if (!isMounted) return;

        simpleUserRef.current = simpleUser;
        setIsRegistered(true);
        setStatus("Registered");
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
      setStatus(`Preparing microphone...`);

      // Mobile-safe permission + microphone warmup
      const tempStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // stop warmup stream; SIP.js will open its own stream for the call
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
      setStatus("Hung up");
    } catch (error) {
      console.error("Hangup failed:", error);
      setStatus("Hangup failed");
      setErrorMessage(getReadableError(error));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
            <Phone className="h-7 w-7 text-blue-700" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Web Phone</h2>
            <p className="text-sm text-slate-600">Status: {status}</p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Registration
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isRegistered
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {isRegistered ? "Connected" : "Not connected"}
            </span>
          </div>

          <p className="text-xs leading-5 text-slate-600">
            SIP Account: <span className="font-semibold">{SIP_AOR}</span>
          </p>
        </div>

        <div>
          <label
            htmlFor="destination"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Extension or Number
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCall();
              }
            }}
            placeholder="1002"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleCall}
            disabled={!isRegistered || isCalling || isInCall}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PhoneCall className="h-4 w-4" />
            Call
          </button>

          <button
            type="button"
            onClick={handleHangup}
            disabled={!isCalling && !isInCall && !hasIncomingCall}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PhoneOff className="h-4 w-4" />
            Hangup
          </button>
        </div>

        {hasIncomingCall && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <PhoneIncoming className="h-5 w-5" />
              <span className="text-sm font-semibold">Incoming call</span>
            </div>

            <button
              type="button"
              onClick={handleAnswer}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Answer
            </button>
          </div>
        )}

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Phone Setup Notes</h3>

        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <p>This page is the first browser-phone version for AsyncAfrica.</p>
          <p>It needs a working Asterisk WebRTC setup with WSS enabled.</p>
          <p>Update the SIP values with your real extension details.</p>
        </div>

        <audio ref={remoteAudioRef} autoPlay />
      </div>
    </div>
  );
}