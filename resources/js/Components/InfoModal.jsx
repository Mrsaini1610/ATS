import { useState, useRef, useEffect } from "react";

export default function InfoModal({
  content,
  trigger = "hover", // "hover" | "click"
  children,
  className = "",
}) {
  const [show, setShow] = useState(false);
  const targetRef = useRef(null);
  const modalRef = useRef(null);
  let hoverTimeout = useRef(null);

  // Show modal immediately
  const showModal = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setShow(true);
  };

  // Hide modal with slight delay to prevent flicker
  const hideModal = () => {
    hoverTimeout.current = setTimeout(() => {
      setShow(false);
    }, 150);
  };

  // Toggle modal for click trigger
  const toggleModal = () => setShow((v) => !v);

  // Handlers depend on trigger
  const handlers =
    trigger === "hover"
      ? {
          onMouseEnter: showModal,
          onMouseLeave: hideModal,
        }
      : {
          onClick: toggleModal,
        };

  // Keep modal visible while hovering over it
  const modalHoverHandlers =
    trigger === "hover"
      ? {
          onMouseEnter: showModal,
          onMouseLeave: hideModal,
        }
      : {};

  // Calculate modal position above the icon button
  const [modalStyle, setModalStyle] = useState({});

  useEffect(() => {
    if (show && targetRef.current && modalRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const modalRect = modalRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;

      setModalStyle({
        position: "absolute",
        width: "200px",
        height: "200px",
        top: targetRect.top + scrollY - modalRect.height - 8 + "px", // 8px space above icon
        left: targetRect.left + scrollX + targetRect.width / 2 - modalRect.width / 2 + "px",
        zIndex: 9999,
      });
    }
  }, [show]);

  return (
    <>
      <button
        type="button"
        ref={targetRef}
        {...handlers}
        className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow duration-200 ${className}`}
        aria-haspopup="true"
        aria-expanded={show}
      >
        {children}
      </button>

      {show && content && (
        <div
          ref={modalRef}
          {...modalHoverHandlers}
          style={modalStyle}
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700 p-4 overflow-auto"
        >
          {content}
        </div>
      )}
    </>
  );
}
