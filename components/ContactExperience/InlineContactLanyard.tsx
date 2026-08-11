"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ProfileCard from "@/components/ProfileCard/ProfileCard";
import "./InlineContactLanyard.css";

const PROFILE_AVATAR = "/assets/changjun-li-profile.jpg";

const Lanyard = dynamic(() => import("@/components/Lanyard/Lanyard"), {
  ssr: false,
  loading: () => null,
});

type InlineContactLanyardProps = {
  email: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function InlineContactLanyard({
  email,
  isOpen,
  onClose,
}: InlineContactLanyardProps) {
  useEffect(() => {
    void import("@/components/Lanyard/Lanyard");
    const profileImage = new Image();
    profileImage.src = PROFILE_AVATAR;
    void profileImage.decode().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const profileCard = (
    <ProfileCard
      name="Changjun Li"
      title="李昌峻 · STUDENT & AI RESEARCHER"
      handle="changjunli"
      status="AVAILABLE"
      contactText="CONTACT"
      avatarUrl={PROFILE_AVATAR}
      miniAvatarUrl={PROFILE_AVATAR}
      showUserInfo
      contactHref={`mailto:${email}`}
      enableTilt={false}
      behindGlowEnabled={false}
      innerGradient="linear-gradient(145deg, rgba(4, 5, 8, 0.52) 0%, rgba(41, 55, 76, 0.36) 48%, rgba(61, 31, 74, 0.48) 100%)"
    />
  );

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          className="inline-contact-lanyard"
          aria-label="Changjun Li contact card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="inline-lanyard-canvas">
            <Lanyard
              position={[0, 0, 17.5]}
              gravity={[0, -40, 0]}
              fov={20}
              transparent
              lanyardWidth={1}
              profileContent={profileCard}
            />
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
