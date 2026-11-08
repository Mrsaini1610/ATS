import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { ShieldAlert, Smartphone, Laptop, LogIn, AlertTriangle } from "lucide-react";

/**
 * SingleSessionModal
 * Monitors single-device active session for Candidates & Admins.
 * Displays an unmissable modal popup when account is logged in on another device.
 */
export default function SingleSessionModal() {
  const { auth, flash } = usePage().props;
  const user = auth?.user;
  const admin = auth?.admin;

  const [isOpen, setIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isAdminGuard, setIsAdminGuard] = useState(false);

  // Check if flash passed logged_out_other_device
  useEffect(() => {
    if (flash?.logged_out_other_device) {
      setModalMessage(flash.logged_out_other_device);
      setIsAdminGuard(Boolean(window.location.pathname.startsWith("/admin")));
      setIsOpen(true);
    }
  }, [flash?.logged_out_other_device]);

  // Periodic heartbeat session check while logged in
  useEffect(() => {
    const isCurrentAdminPath = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
    if (isCurrentAdminPath && !admin) return;
    if (!isCurrentAdminPath && !user) return;

    const checkSession = async () => {
      try {
        const guardParam = isCurrentAdminPath ? "admin" : "web";
        const response = await fetch(`/auth/session-check?guard=${guardParam}`, {
          headers: {
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.active === false) {
            setModalMessage(
              data.message ||
                "Aapka account kisi doosre device ya browser me login kiya gaya hai. Is wajah se aapka session yahan band kar diya gaya hai."
            );
            setIsAdminGuard(data.guard === "admin");
            setIsOpen(true);
          }
        }
      } catch (err) {
        // network error or ignored
      }
    };

    // Initial check on mount/focus
    const onFocus = () => checkSession();
    window.addEventListener("focus", onFocus);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onBeforeUnload = () => {
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/auth/set-offline");
        }
      } catch (e) {}
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    // Heartbeat every 20 seconds
    const interval = setInterval(checkSession, 20000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [user?.id, admin?.id]);

  const handleAcknowledge = () => {
    setIsOpen(false);
    if (isAdminGuard || window.location.pathname.startsWith("/admin")) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/login";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border-2 border-amber-300 text-center relative overflow-hidden transform scale-100 transition-all">
        {/* Top Warning Banner Glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        {/* Dual Device Icon Graphic */}
        <div className="relative mx-auto w-16 h-16 mb-4 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-amber-600 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Modal Title */}
        <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight mb-2">
          Doosre Device Me Login Hua Hai!
        </h3>

        {/* Device Badges */}
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Laptop className="w-3.5 h-3.5 text-amber-600" />
          <span>Single Session Active Policy</span>
          <Smartphone className="w-3.5 h-3.5 text-amber-600" />
        </div>

        {/* Explanation Message */}
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          {modalMessage ||
            "Aapka account kisi doosre device, mobile app ya browser mein abhi-abhi login kiya gaya hai. Suraksha ke liye is screen par aapka session band (logout) kar diya gaya hai."}
        </p>

        {/* Call to action */}
        <button
          type="button"
          onClick={handleAcknowledge}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <LogIn className="w-4 h-4" /> Theek Hai / Phir Se Login Karein
        </button>

        <p className="text-[11px] text-gray-400 mt-3 font-medium">
          Agar yeh aap nahi the, to kripya turant apna account verify karein.
        </p>
      </div>
    </div>
  );
}

