"use client";

import Icon from "./Icon";

const SIZES = { md: "max-w-md", lg: "max-w-2xl" };

export default function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-ink/40 z-30 flex items-center justify-center px-5 py-8"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`card w-full ${SIZES[size] || SIZES.md} bg-surface max-h-full flex flex-col`}>
        <div className="card-header shrink-0">
          <h2 className="font-display text-base text-ink font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
        <div className="card-body overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
