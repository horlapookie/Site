import { useState, useEffect } from "react";

interface FullscreenAdModalProps {
  open: boolean;
  onClose: () => void;
  onTimeComplete?: () => void;
}

export function FullscreenAdModal({ open, onClose, onTimeComplete }: FullscreenAdModalProps) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeLeft(5);
      setCanClose(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          onTimeComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, onTimeComplete]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">
      <button
        onClick={onClose}
        disabled={!canClose}
        className={`absolute top-4 right-4 px-6 py-3 rounded-lg font-semibold transition-all ${
          canClose
            ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
      >
        {canClose ? "Back to Tasks" : `Wait ${timeLeft}s`}
      </button>

      <div className="w-full h-full flex items-center justify-center p-4">
        <iframe
          src="https://rel-s.com/4/10218851?var=eclipse-md-horkapookie.zone.id"
          style={{
            width: "100%",
            maxWidth: "800px",
            height: "600px",
            border: "none",
            borderRadius: "0.5rem",
          }}
          scrolling="no"
          title="Advertisement"
        />
      </div>
    </div>
  );
}
