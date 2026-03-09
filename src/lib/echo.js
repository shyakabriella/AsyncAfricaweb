import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
const reverbHost = import.meta.env.VITE_REVERB_HOST;
const reverbPort = Number(import.meta.env.VITE_REVERB_PORT || 443);
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || "https";

console.log("REVERB KEY:", reverbKey);
console.log("REVERB HOST:", reverbHost);
console.log("REVERB PORT:", reverbPort);
console.log("REVERB SCHEME:", reverbScheme);

let echo = null;

if (reverbKey) {
  echo = new Echo({
    broadcaster: "reverb",
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: reverbScheme === "https",
    enabledTransports: ["ws", "wss"],
  });
} else {
  console.error("Missing VITE_REVERB_APP_KEY in production build");
}

export default echo;