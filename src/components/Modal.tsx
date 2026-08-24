import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div className="card-modal">
      <div className="card-modal-backdrop" onClick={onClose} />
      <div className="card-modal-content">
        <button
          type="button"
          className="card-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          X
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

//deliberate and generic, it knows nothing about pokemon or TCG cards
//just "some content, in an overlay that can close itself"
//its the kind of component that will be reached for again the app needs a second model
