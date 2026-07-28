"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import ProfileCard from "@/components/ProfileCard/ProfileCard";
import "./InlineContactLanyard.css";

const PROFILE_AVATAR_PLACEHOLDER =
  "https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png";

const Lanyard = dynamic(() => import("@/components/Lanyard/Lanyard"), {
  ssr: false,
  loading: () => (
    <div className="inline-lanyard-loader" role="status">
      <span />
      <p>正在加载名片</p>
    </div>
  ),
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
      title="李昌峻 · 3D Creator"
      handle="changjunli"
      status="开放合作"
      contactText="联系我"
      avatarUrl={PROFILE_AVATAR_PLACEHOLDER}
      miniAvatarUrl={PROFILE_AVATAR_PLACEHOLDER}
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

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          className="inline-contact-lanyard"
          aria-label="李昌峻的联系名片"
          initial={{ opacity: 0, y: -48, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -64, scale: 0.96 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-lanyard-glow" aria-hidden="true" />
          <div className="inline-lanyard-hint" aria-hidden="true">
            <span>抓住名片</span>
            <span>拖动 · 松开 · 摆动</span>
          </div>
          <button
            className="inline-lanyard-close"
            type="button"
            onClick={onClose}
            aria-label="收起联系名片"
          >
            <X aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
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
