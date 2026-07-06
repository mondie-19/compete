"use client";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function Radio({ name, options, value, onChange }: RadioProps) {
  return (
    <>
      <style>{`
        .rd-wrapper {
          --rd-bg:      #0F0F16;
          --rd-border:  #9B5CFF;
          --rd-active:  #9B5CFF;
          --rd-text:    rgba(255,255,255,0.45);
          --rd-text-on: #ffffff;
          position: relative;
          display: inline-flex;
          background-color: var(--rd-bg);
          border: 2px solid var(--rd-border);
          border-radius: 34px;
          box-shadow: 4px 4px 0 rgba(155, 92, 255, 0.35);
          padding: 3px;
          gap: 2px;
        }

        .rd-option {
          position: relative;
          flex: 1;
        }

        .rd-input {
          position: absolute;
          inset: 0;
          appearance: none;
          cursor: pointer;
          margin: 0;
        }

        .rd-btn {
          height: 30px;
          padding: 0 14px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          transition: background-color 0.18s ease;
          white-space: nowrap;
        }

        .rd-span {
          font-family: inherit;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--rd-text);
          transition: color 0.18s ease;
          user-select: none;
        }

        .rd-input:checked + .rd-btn {
          background-color: var(--rd-active);
        }

        .rd-input:checked + .rd-btn .rd-span {
          color: var(--rd-text-on);
        }
      `}</style>

      <div className="rd-wrapper">
        {options.map((opt) => (
          <div key={opt.value} className="rd-option">
            <input
              className="rd-input"
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            <div className="rd-btn">
              <span className="rd-span">{opt.label}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
