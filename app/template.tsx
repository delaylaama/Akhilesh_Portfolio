"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/components/providers/GameProvider";

const BARS = 8;
/** Skip the wipe on the very first page load so server-rendered content is never covered. */
let firstLoad = true;

/**
 * Page change: stepped bars wipe off the screen (~350ms). The new page is
 * rendered and interactive underneath immediately — the wipe never blocks input.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const { reducedMotion } = useGame();
  const [wipe] = useState(() => !firstLoad);
  useEffect(() => {
    firstLoad = false;
  }, []);
  return (
    <>
      {wipe && !reducedMotion && (
        <div className="pointer-events-none fixed inset-0 z-[45] flex flex-col" aria-hidden="true">
          {Array.from({ length: BARS }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 origin-right bg-void"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 0.22, delay: i * 0.025, ease: [0.8, 0, 0.2, 1] }}
            />
          ))}
        </div>
      )}
      {children}
    </>
  );
}
