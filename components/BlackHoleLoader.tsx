"use client";

export default function BlackHoleLoader({ label }: { label?: string }) {
  return (
    <>
      <style>{`
        .bh-ring-3 {
          box-shadow: 0 0 10px 15px #9B5CFF;
          border-radius: 50%;
          padding: 2px;
        }
        .bh-ring-2 {
          box-shadow: 0 0 2px 10px #0A0A0F;
          border-radius: 50%;
          padding: 2px;
        }
        .bh-ring-1 {
          position: relative;
          box-shadow: 0 0 10px 15px #9B5CFF;
          border-radius: 50%;
          padding: 2px;
        }
        .bh-hole {
          height: 128px;
          aspect-ratio: 1;
          background-color: #0A0A0F;
          border-radius: 50%;
          box-shadow: 0 0 20px 10px #0A0A0F, inset 0 0 10px #9B5CFF88;
        }
        .bh-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 350px;
          height: 350px;
          background: radial-gradient(
            circle,
            rgba(155, 92, 255, 0.22) 5%,
            rgba(155, 92, 255, 0.10) 20%,
            rgba(155, 92, 255, 0) 70%
          );
          border-radius: 50%;
          z-index: -1;
        }
        .bh-orbit {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotateX(75deg);
        }
        .bh-crescent {
          filter:
            drop-shadow(0 0 5px #9B5CFF)
            drop-shadow(0 0 15px #9B5CFF)
            drop-shadow(0 0 30px #7B3CDF)
            drop-shadow(0 0 50px #5B1CB0);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: rotate(180deg);
          width: 200px;
          height: 12px;
          clip-path: ellipse(60% 100% at 100% 50%);
          offset-path: path("M 0,-100 A 100,100 0 1,1 0,100 A 100,100 0 1,1 0,-100 Z");
          offset-distance: 0%;
          opacity: 0;
        }
        .bh-c1 { animation: bh-orbit 500ms ease-in-out 0ms   infinite; }
        .bh-c2 { animation: bh-orbit 500ms ease-in-out 83ms  infinite; }
        .bh-c3 { animation: bh-orbit 500ms ease-in-out 167ms infinite; }
        .bh-c4 { animation: bh-orbit 500ms ease-in-out 250ms infinite; }
        .bh-c5 { animation: bh-orbit 500ms ease-in-out 333ms infinite; }
        .bh-c6 { animation: bh-orbit 500ms ease-in-out 417ms infinite; }

        @keyframes bh-orbit {
          18%  { offset-distance: 25%; opacity: 0; }
          25%  { opacity: 1; }
          75%  { opacity: 1; }
          100% { offset-distance: 90%; opacity: 0; }
        }
      `}</style>

      <div className="flex flex-col items-center justify-center gap-10">
        <div className="relative">
          <div className="bh-ring-3">
            <div className="bh-ring-2">
              <div className="bh-ring-1">
                <div className="bh-hole" />
                <div className="bh-glow" />
              </div>
            </div>
          </div>

          <div className="bh-orbit">
            {(["bh-c1","bh-c2","bh-c3","bh-c4","bh-c5","bh-c6"] as const).map(cls => (
              <svg key={cls} className={`bh-crescent ${cls}`} viewBox="0 0 50 50">
                <path d="M 0 0 C 54 50 185 57 226 0 C 198 39 35 32 0 0" fill="#9B5CFF55" />
              </svg>
            ))}
          </div>
        </div>

        {label && (
          <p className="text-[10px] font-black tracking-[0.5em] text-white/30 uppercase animate-pulse">
            {label}
          </p>
        )}
      </div>
    </>
  );
}
