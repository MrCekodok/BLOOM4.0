import { useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Language, translate } from "../translations";

interface LogoutScreenProps {
  language: Language;
  onClose: () => void;
}

export default function LogoutScreen({ language, onClose }: LogoutScreenProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 bg-[#F9F6F0] flex flex-col items-center justify-center p-6 select-none overflow-y-auto">
      {/* Background radial soft light blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-100/50 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-2xl w-full text-center space-y-8 z-10 p-4">
        {/* Central Calming Vector Illustration */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1, type: "spring", stiffness: 30 }}
          className="relative mx-auto w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center p-6 bg-gradient-to-b from-teal-50/50 via-purple-50/40 to-amber-50/30 rounded-[3rem] border border-[#EBDEF0]/60 shadow-xs group"
        >
          {/* Animated decorative circling particle ring */}
          <div className="absolute inset-4 rounded-full border border-dashed border-[#8E44AD]/10 animate-[spin_40s_linear_infinite]" />
          <div className="absolute inset-8 rounded-full border border-[#27AE60]/5 animate-[spin_25s_linear_infinite_reverse]" />

          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-xl z-10"
          >
            {/* Background glowing disk */}
            <circle cx="50" cy="50" r="38" fill="url(#grad-sun)" opacity="0.85" />

            {/* Quiet Hills */}
            <path
              d="M12,65 Q35,55 58,68 Q78,58 88,65 L88,85 L12,85 Z"
              fill="url(#grad-hills-1)"
              opacity="0.9"
            />
            <path
              d="M20,70 Q45,62 70,72 Q82,68 85,70 L85,85 L20,85 Z"
              fill="url(#grad-hills-2)"
            />

            {/* Gentle stream/road path */}
            <path
              d="M50,71 Q52,78 48,85"
              fill="none"
              stroke="#D5F5E3"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Majestic Blooming Flower / Companion Tree in Center */}
            <g className="animate-[bounce_6s_ease-in-out_infinite]">
              {/* Main sturdy trunk */}
              <path
                d="M50,71 Q47,50 50,30"
                stroke="url(#grad-trunk)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />

              {/* Side Branches */}
              <path
                d="M48,52 Q35,46 32,52"
                stroke="#27AE60"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M51,46 Q62,38 66,44"
                stroke="#27AE60"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Soothing big healthy leaves */}
              <path d="M32,52 C24,54 22,46 30,44 C38,42 34,50 32,52" fill="url(#grad-leaf)" />
              <path d="M66,44 C74,46 76,38 68,36 C60,34 64,42 66,44" fill="url(#grad-leaf)" />

              {/* Center Blooming Lotus/Crown */}
              <g className="animate-pulse">
                {/* Petals */}
                <path d="M50,30 C42,20 42,12 50,8 C58,12 58,20 50,30" fill="url(#grad-petal-center)" />
                <path d="M50,30 C38,24 34,16 43,10 C52,4 47,22 50,30" fill="url(#grad-petal-side-1)" opacity="0.9" />
                <path d="M50,30 C62,24 66,16 57,10 C48,4 53,22 50,30" fill="url(#grad-petal-side-2)" opacity="0.9" />
                
                {/* Golden glowing core */}
                <circle cx="50" cy="18" r="4" fill="#F4D03F" className="animate-ping [animation-duration:3s]" />
                <circle cx="50" cy="18" r="3.5" fill="#F5C71A" />
              </g>

              {/* Little cute forest buddy sleeping underneath */}
              <g transform="translate(36, 64)">
                {/* Sleeping seed pod */}
                <rect x="0" y="0" width="8" height="6" rx="3" fill="#D35400" />
                {/* Cute sleeping face closed eyes */}
                <path d="M2,3 Q3,4 4,3" stroke="#fff" strokeWidth="0.5" fill="none" />
                <path d="M5,3 Q6,4 7,3" stroke="#fff" strokeWidth="0.5" fill="none" />
                {/* Tiny sprout hat */}
                <path d="M4,0 Q3,-3 1,-2" stroke="#2ECC71" strokeWidth="1" fill="none" />
              </g>

              {/* Second companion sprout */}
              <g transform="translate(56, 66)">
                <ellipse cx="0" cy="0" rx="3" ry="2" fill="#E67E22" />
                <path d="M0,0 Q1,-4 3,-3" stroke="#2ECC71" strokeWidth="0.8" fill="none" />
              </g>
            </g>

            {/* Drifting wind swirls */}
            <path
              d="M15,30 Q30,22 45,35"
              fill="none"
              stroke="#E8F8F5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 4"
              opacity="0.6"
              className="animate-[dash_8s_linear_infinite]"
            />
            <path
              d="M60,48 Q75,40 85,55"
              fill="none"
              stroke="#E8F8F5"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="3 3"
              opacity="0.5"
              className="animate-[dash_10s_linear_infinite]"
            />

            {/* Sparkles of light popping up */}
            <circle cx="25" cy="22" r="1" fill="#fff" className="animate-pulse" />
            <circle cx="78" cy="25" r="1.5" fill="#F4D03F" className="animate-pulse" />
            <circle cx="28" cy="46" r="1.2" fill="#fff" opacity="0.8" />
            <circle cx="72" cy="62" r="1.2" fill="#fff" opacity="0.8" />

            {/* Gradients Defined */}
            <defs>
              <radialGradient id="grad-sun" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDEDEC" />
                <stop offset="50%" stopColor="#FCF3CF" />
                <stop offset="100%" stopColor="#EAFAF1" />
              </radialGradient>
              <linearGradient id="grad-hills-1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A2D9CE" />
                <stop offset="100%" stopColor="#45B39D" />
              </linearGradient>
              <linearGradient id="grad-hills-2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#73C6B6" />
                <stop offset="100%" stopColor="#16A085" />
              </linearGradient>
              <linearGradient id="grad-trunk" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E8449" />
                <stop offset="100%" stopColor="#27AE60" />
              </linearGradient>
              <linearGradient id="grad-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#58D68D" />
                <stop offset="100%" stopColor="#229954" />
              </linearGradient>
              <linearGradient id="grad-petal-center" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5B041" />
                <stop offset="100%" stopColor="#EC7063" />
              </linearGradient>
              <linearGradient id="grad-petal-side-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EB984E" />
                <stop offset="100%" stopColor="#E74C3C" />
              </linearGradient>
              <linearGradient id="grad-petal-side-2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5B7B1" />
                <stop offset="100%" stopColor="#D98880" />
              </linearGradient>
            </defs>
          </svg>

          {/* Floating animated clouds in background */}
          <div className="absolute top-4 left-6 w-14 h-6 bg-white/70 rounded-full blur-xs animate-[bounce_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-12 right-6 w-16 h-7 bg-white/60 rounded-full blur-xs animate-[bounce_10s_ease-in-out_infinite_1s]" />
        </motion.div>

        {/* Motivational Messaging with dynamic transition */}
        <div className="max-w-md mx-auto space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2xl sm:text-3xl font-serif font-extrabold text-[#2C3E50] leading-tight"
          >
            {translate(language, "logoutPageMessage")}
          </motion.h2>
        </div>

        {/* Action Button & Return trigger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="pt-4"
        >
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#8E44AD] to-[#7D3C98] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-103 active:scale-97 cursor-pointer"
          >
            <span>{translate(language, "logoutPageButton")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
