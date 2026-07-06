"use client";
import { useRef, useId, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select",
  className = "",
  icon,
}: DropdownProps) {
  const raw   = useId().replace(/:/g, "");
  const popId = `dd-pop-${raw}`;
  const anc   = `--dd-${raw}`;
  const btnRef = useRef<HTMLButtonElement>(null);

  const selectedLabel = options.find(o => o.value === value)?.label ?? placeholder;

  useEffect(() => {
    const el = document.getElementById(popId) as HTMLElement | null;
    if (!el) return;
    const onToggle = (e: Event) => {
      const te = e as { newState: string };
      if (te.newState === "open" && btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        el.style.top      = `${r.bottom + 1}px`;
        el.style.left     = `${r.left}px`;
        el.style.minWidth = `${r.width}px`;
      }
    };
    el.addEventListener("toggle", onToggle);
    return () => el.removeEventListener("toggle", onToggle);
  }, [popId]);

  const pick = (val: string) => {
    onChange(val);
    (document.getElementById(popId) as any)?.hidePopover?.();
  };

  return (
    <>
      <style>{`
        .dd-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 7px 12px;
          color: rgba(255,255,255,0.8);
          font-family: inherit;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.2s, background 0.2s;
        }
        .dd-btn:hover { border-color: rgba(155,92,255,0.45); background: rgba(255,255,255,0.04); }

        .dd-list:popover-open {
          position: fixed !important;
          inset: unset !important;
          margin: 0 !important;
        }
        .dd-list {
          background: #0F0F16;
          border: 1px solid rgba(155,92,255,0.3);
          border-radius: 10px;
          padding: 3px;
          list-style: none;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(155,92,255,0.08);
          z-index: 9999;
          min-width: 120px;
        }
        .dd-item {
          width: 100%;
          display: block;
          background: none;
          border: none;
          padding: 7px 12px;
          text-align: left;
          font-family: inherit;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          border-radius: 7px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .dd-item:hover   { background: rgba(155,92,255,0.15); color: #fff; }
        .dd-item.dd-sel  { color: #9B5CFF; }
      `}</style>

      {/* Trigger */}
      <button
        ref={btnRef}
        type="button"
        {...{ popoverTarget: popId } as React.ButtonHTMLAttributes<HTMLButtonElement>}
        style={{ anchorName: anc } as React.CSSProperties}
        className={`dd-btn ${className}`}
      >
        {icon && <span className="shrink-0 text-compete-purple">{icon}</span>}
        <span style={{ flex: 1 }}>{selectedLabel}</span>
        <ChevronDown size={10} style={{ opacity: 0.35, flexShrink: 0 }} />
      </button>

      {/* Popover list */}
      <ul
        {...{ popover: "auto", id: popId } as React.HTMLAttributes<HTMLUListElement>}
        style={{ positionAnchor: anc } as React.CSSProperties}
        className="dd-list"
      >
        {options.map(opt => (
          <li key={opt.value}>
            <button
              type="button"
              className={`dd-item${opt.value === value ? " dd-sel" : ""}`}
              onClick={() => pick(opt.value)}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
