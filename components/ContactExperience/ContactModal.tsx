"use client";

import dynamic from "next/dynamic";
import {
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import ProfileCard from "@/components/ProfileCard/ProfileCard";
import "./ContactModal.css";

const JACK_AVATAR =
  "https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png";

const Lanyard = dynamic(() => import("@/components/Lanyard/Lanyard"), {
  ssr: false,
  loading: () => (
    <div className="contact-loader" role="status">
      <span />
      <p>Preparing your pass</p>
    </div>
  ),
});

type ContactModalProps = {
  email: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ContactModal({
  email,
  isOpen,
  onClose,
}: ContactModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 40);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const closeFromBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const profileCard = (
    <ProfileCard
      name="Jack"
      title="3D Creator"
      handle="jackstudio"
      status="Available for projects"
      contactText="Email me"
      avatarUrl={JACK_AVATAR}
      miniAvatarUrl={JACK_AVATAR}
      showUserInfo
      enableTilt={false}
      behindGlowEnabled
      behindGlowColor="rgba(182, 0, 168, 0.66)"
      innerGradient="linear-gradient(145deg, rgba(11, 11, 14, 0.98) 0%, rgba(94, 16, 122, 0.82) 52%, rgba(190, 76, 0, 0.62) 100%)"
      onContactClick={() => {
        window.location.href = `mailto:${email}`;
      }}
    />
  );

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="contact-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onMouseDown={closeFromBackdrop}
        >
          <motion.div
            className="contact-modal-panel"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985, y: 10 }}
            transition={{
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="contact-modal-header">
              <div>
                <p>Identity / 001</p>
                <h2 id="contact-modal-title">Catch the card</h2>
              </div>
              <button
                ref={closeButtonRef}
                className="contact-modal-close"
                type="button"
                onClick={onClose}
                aria-label="Close contact card"
              >
                <X aria-hidden="true" size={22} strokeWidth={1.8} />
              </button>
            </div>

            <div className="contact-lanyard-stage">
              <div className="contact-stage-glow" aria-hidden="true" />
              <div className="contact-stage-label" aria-hidden="true">
                <span>Drag</span>
                <span>Release</span>
                <span>Swing</span>
              </div>
              <Lanyard
                position={[0, 0, 17.5]}
                gravity={[0, -40, 0]}
                fov={20}
                transparent
                lanyardWidth={1}
                profileContent={profileCard}
              />
            </div>

            <div className="contact-modal-footer">
              <p>Drag the pass and let it swing.</p>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
