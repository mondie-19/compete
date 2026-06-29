"use client";

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Switch({ checked, defaultChecked, onChange, disabled }: SwitchProps) {
  return (
    <>
      <style>{`
        .cs-switch {
          --switch-width: 46px;
          --switch-height: 24px;
          --switch-bg: rgba(255, 255, 255, 0.12);
          --switch-checked-bg: #9B5CFF;
          --switch-offset: calc((var(--switch-height) - var(--circle-diameter)) / 2);
          --switch-transition: all .2s cubic-bezier(0.27, 0.2, 0.25, 1.51);
          --circle-diameter: 18px;
          --circle-bg: #ffffff;
          --circle-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          --circle-checked-shadow: -1px 1px 2px rgba(0, 0, 0, 0.4);
          --circle-transition: var(--switch-transition);
          --icon-transition: all .2s cubic-bezier(0.27, 0.2, 0.25, 1.51);
          --icon-cross-color: rgba(255, 255, 255, 0.4);
          --icon-cross-size: 6px;
          --icon-checkmark-color: #9B5CFF;
          --icon-checkmark-size: 10px;
          --effect-width: calc(var(--circle-diameter) / 2);
          --effect-height: calc(var(--effect-width) / 2 - 1px);
          --effect-bg: var(--circle-bg);
          --effect-border-radius: 1px;
          --effect-transition: all .2s ease-in-out;
          display: inline-block;
        }

        .cs-switch input { display: none; }

        .cs-switch svg {
          transition: var(--icon-transition);
          position: absolute;
          height: auto;
        }

        .cs-switch .cs-checkmark {
          width: var(--icon-checkmark-size);
          color: var(--icon-checkmark-color);
          transform: scale(0);
        }

        .cs-switch .cs-cross {
          width: var(--icon-cross-size);
          color: var(--icon-cross-color);
        }

        .cs-slider {
          box-sizing: border-box;
          width: var(--switch-width);
          height: var(--switch-height);
          background: var(--switch-bg);
          border-radius: 999px;
          display: flex;
          align-items: center;
          position: relative;
          transition: var(--switch-transition);
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .cs-circle {
          width: var(--circle-diameter);
          height: var(--circle-diameter);
          background: var(--circle-bg);
          border-radius: inherit;
          box-shadow: var(--circle-shadow);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--circle-transition);
          z-index: 1;
          position: absolute;
          left: var(--switch-offset);
        }

        .cs-slider::before {
          content: "";
          position: absolute;
          width: var(--effect-width);
          height: var(--effect-height);
          left: calc(var(--switch-offset) + (var(--effect-width) / 2));
          background: var(--effect-bg);
          border-radius: var(--effect-border-radius);
          transition: var(--effect-transition);
        }

        /* checked state */
        .cs-switch input:checked + .cs-slider {
          background: var(--switch-checked-bg);
          border-color: #7B3CDF;
          box-shadow: 0 0 12px rgba(155, 92, 255, 0.4);
        }
        .cs-switch input:checked + .cs-slider .cs-checkmark {
          transform: scale(1);
        }
        .cs-switch input:checked + .cs-slider .cs-cross {
          transform: scale(0);
        }
        .cs-switch input:checked + .cs-slider::before {
          left: calc(100% - var(--effect-width) - (var(--effect-width) / 2) - var(--switch-offset));
        }
        .cs-switch input:checked + .cs-slider .cs-circle {
          left: calc(100% - var(--circle-diameter) - var(--switch-offset));
          box-shadow: var(--circle-checked-shadow);
        }

        /* disabled */
        .cs-switch.cs-disabled {
          opacity: 0.45;
          pointer-events: none;
        }
      `}</style>

      <label className={`cs-switch${disabled ? " cs-disabled" : ""}`}>
        <input
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        />
        <div className="cs-slider">
          <div className="cs-circle">
            <svg className="cs-cross" xmlSpace="preserve" viewBox="0 0 365.696 365.696" width={6} height={6} xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0" />
            </svg>
            <svg className="cs-checkmark" xmlSpace="preserve" viewBox="0 0 24 24" width={10} height={10} xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z" />
            </svg>
          </div>
        </div>
      </label>
    </>
  );
}
