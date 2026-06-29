"use client";

interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export default function Checkbox({ checked, defaultChecked, onChange, disabled, label }: CheckboxProps) {
  return (
    <>
      <style>{`
        .cb-container {
          --input-focus:        #9B5CFF;
          --input-unchecked:    rgba(255, 255, 255, 0.08);
          --bg-color:           #ffffff;
          --main-color:         #9B5CFF;
          position: relative;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .cb-container.cb-disabled {
          opacity: 0.45;
          pointer-events: none;
        }
        .cb-container input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        .cb-mark {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          position: relative;
          border: 2px solid var(--main-color);
          border-radius: 5px;
          box-shadow: 3px 3px 0 var(--main-color);
          background-color: var(--input-unchecked);
          transition: all 0.3s;
        }
        .cb-container input:checked ~ .cb-mark {
          background-color: var(--input-focus);
          box-shadow: 3px 3px 0 #7B3CDF;
        }
        .cb-mark::after {
          content: "";
          width: 7px;
          height: 15px;
          position: absolute;
          top: 2px;
          left: 8px;
          display: none;
          border: solid var(--bg-color);
          border-width: 0 2.5px 2.5px 0;
          transform: rotate(45deg);
        }
        .cb-container input:checked ~ .cb-mark::after {
          display: block;
        }
        .cb-label {
          font-family: inherit;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          transition: color 0.2s;
          user-select: none;
        }
        .cb-container:hover .cb-label {
          color: rgba(255,255,255,0.85);
        }
      `}</style>

      <label className={`cb-container${disabled ? " cb-disabled" : ""}`}>
        <input
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        />
        <div className="cb-mark" />
        {label && <span className="cb-label">{label}</span>}
      </label>
    </>
  );
}
