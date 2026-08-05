import React, { useEffect } from "react";

export default function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">{children}</div>

        {footer ? (
          <div className="modal-head" style={{ borderTop: "1px solid var(--line)", borderBottom: "0" }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}