import React, { useState, useEffect, useRef } from "react";
import { Bell, X, ExternalLink, CheckCircle2, Calendar, FileText, Briefcase, Info } from "lucide-react";

/**
 * Plays a pleasant WhatsApp / iOS style notification chime using Web Audio API.
 */
function playLiveChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    // Pleasant dual chime
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

    osc2.frequency.setValueAtTime(783.99, now); // G5
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.08); // C6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (e) {
    // Autoplay restrictions or unsupported audio
  }
}

/**
 * Returns icon and color styling based on notification type.
 */
function getTypeConfig(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("offer") || t.includes("hired")) {
    return {
      icon: CheckCircle2,
      badgeColor: "bg-emerald-500",
      accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      tag: "Job Offer",
    };
  }
  if (t.includes("interview")) {
    return {
      icon: Calendar,
      badgeColor: "bg-purple-500",
      accentBg: "bg-purple-50 text-purple-700 border-purple-200",
      tag: "Interview",
    };
  }
  if (t.includes("application") || t.includes("applied")) {
    return {
      icon: FileText,
      badgeColor: "bg-blue-500",
      accentBg: "bg-blue-50 text-blue-700 border-blue-200",
      tag: "Application",
    };
  }
  if (t.includes("job")) {
    return {
      icon: Briefcase,
      badgeColor: "bg-indigo-500",
      accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      tag: "New Opening",
    };
  }
  return {
    icon: Bell,
    badgeColor: "bg-blue-600",
    accentBg: "bg-gray-100 text-gray-700 border-gray-200",
    tag: "Notification",
  };
}

export default function RealtimeNotificationToast() {
  const [activeToasts, setActiveToasts] = useState([]);
  const seenIdsRef = useRef(new Set());
  const lastSyncTimeRef = useRef(null);

  // Auto request browser desktop notification permission gently
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        const handleFirstInteraction = () => {
          Notification.requestPermission().catch(() => {});
          window.removeEventListener("click", handleFirstInteraction);
        };
        window.addEventListener("click", handleFirstInteraction, { once: true });
      }
    }
  }, []);

  const dismissToast = (id) => {
    setActiveToasts((prev) => prev.filter((item) => item.id !== id));
    // Optional: mark as read on backend
    try {
      fetch(`/notifications/mark-read/${id}`, {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
      }).catch(() => {});
    } catch (e) {}
  };

  // Polling loop every 6 seconds for live real-time sync
  useEffect(() => {
    let isMounted = true;

    const pollLiveNotifications = async () => {
      try {
        const params = new URLSearchParams();
        if (lastSyncTimeRef.current) {
          params.append("since", lastSyncTimeRef.current);
        }

        const res = await fetch(`/notifications/live-sync?${params.toString()}`, {
          headers: {
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.success) return;

        if (data.server_time) {
          lastSyncTimeRef.current = data.server_time;
        }

        const newItems = (data.notifications || []).filter(
          (item) => !seenIdsRef.current.has(item.id)
        );

        if (newItems.length > 0) {
          // Play live chime
          playLiveChime();

          newItems.forEach((item) => {
            seenIdsRef.current.add(item.id);

            // Desktop push if backgrounded
            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted" &&
              document.hidden
            ) {
              try {
                new Notification(item.title, {
                  body: item.body,
                  icon: "/favicon.ico",
                });
              } catch (e) {}
            }
          });

          // Add to active floating toasts (limit to last 3 simultaneously)
          setActiveToasts((prev) => [...newItems, ...prev].slice(0, 3));
        }
      } catch (err) {
        // Silent fail on network blip
      }
    };

    // Initial check after 2 seconds, then every 6 seconds
    const initialTimer = setTimeout(pollLiveNotifications, 2000);
    const interval = setInterval(pollLiveNotifications, 6000);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  if (activeToasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {activeToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const cfg = getTypeConfig(toast.type);
  const Icon = cfg.icon;

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id]);

  return (
    <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/80 p-3.5 relative overflow-hidden transition-all duration-300 ease-out animate-slide-in hover:shadow-emerald-500/10 hover:border-gray-300">
      {/* 5-second progress bar animation */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 overflow-hidden">
        <div
          className={`h-full ${cfg.badgeColor} transition-all duration-[5000ms] ease-linear w-full`}
          style={{ animation: "toast-progress 5s linear forwards" }}
        />
      </div>

      <div className="flex items-start gap-3 mt-1">
        {/* Leading Icon */}
        <div className={`w-9 h-9 rounded-xl ${cfg.accentBg} flex items-center justify-center shrink-0 border`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {cfg.tag} • {toast.time_ago || "Just now"}
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer transition"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-gray-900 leading-snug line-clamp-1">
            {toast.title}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
            {toast.body}
          </p>

          {/* Action Link */}
          {toast.action_url && (
            <div className="mt-2 flex items-center gap-2">
              <a
                href={toast.action_url}
                onClick={onDismiss}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
              >
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

