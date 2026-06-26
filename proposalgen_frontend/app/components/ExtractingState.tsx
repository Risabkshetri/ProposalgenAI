import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  "Reading your brief...",
  "Writing scope...",
  "Structuring milestones...",
  "Building proposal..."
];

export default function ExtractingState() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] w-full bg-white relative overflow-hidden">

      {/* Appspine Logo with Pulse Animation */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-[#3b82f6] rounded-full blur-xl opacity-40 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute inset-0 bg-[#1a56c4] rounded-full opacity-20 scale-150 animate-[pulse_1.2s_ease-in-out_infinite]"></div>

        <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl z-10 animate-[pulse_1.2s_ease-in-out_infinite] p-2">
          <Image src="/appspine_logo.png" alt="Appspine Logo" width={80} height={80} className="object-contain" />
        </div>
      </div>

      {/* Cycling Text */}
      <div className="h-8 relative w-[280px] flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-[20px] font-semibold text-[#0d2d6e] absolute"
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

    </div>
  );
}
