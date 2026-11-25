import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { IconButton } from "./IconButton";
import "./Dialog.css";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DialogProps {
  onClose: () => void;
  "aria-label": string;
  //sheet: the white sheet (settings). stage: the black card stage, which
  //turns into a bottom sheet on phones (B&W-7, spec 7.4 and 8)
  variant?: "sheet" | "stage";
  children: ReactNode;
}

export function Dialog({
  onClose,
  "aria-label": arialabel,
  variant = "sheet",
  children,
}: DialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  //focus management: move focus in on mount, give it back on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable =
      contentRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable?.[0] ?? contentRef.current)?.focus();

    return () => previouslyFocused?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function trapFocus(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !contentRef.current) return;

    const focusable = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className="dialog" data-variant={variant}>
      <div className="dialog__backdrop" onClick={onClose} />
      <div
        ref={contentRef}
        //the stage is black: its close button and anything else that
        //reads the text and focus roles flips to white
        className={
          variant === "stage" ? "dialog__content on-dark" : "dialog__content"
        }
        role="dialog"
        aria-modal="true"
        aria-label={arialabel}
        tabIndex={-1}
        onKeyDown={trapFocus}
      >
        <div className="dialog__close">
          <IconButton icon="×" aria-label="Close" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
