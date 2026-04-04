import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearStoredAuth, getAuthState } from "../lib/auth";

const IDLE_TIMEOUT = 2 * 60 * 1000; // 2 minutes

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "click",
  "scroll",
  "keydown",
  "touchstart",
];

export default function SessionWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const logoutUser = () => {
      const { token } = getAuthState();

      if (!token) return;

      clearStoredAuth();
      clearTimer();

      navigate("/login", {
        replace: true,
        state: {
          sessionExpired: true,
          message: "You were logged out after 2 minutes of inactivity.",
        },
      });
    };

    const resetTimer = () => {
      clearTimer();

      const { token } = getAuthState();
      if (!token) return;

      timeoutRef.current = window.setTimeout(logoutUser, IDLE_TIMEOUT);
    };

    resetTimer();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer);
    });

    return () => {
      clearTimer();

      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [navigate, location.pathname]);

  return null;
}