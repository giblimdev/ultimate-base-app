/*
path :           app/template.tsx
tag :            ["layout", "template", "transition", "motion", "route"]
projectId:       <UltimateBaseApp>
type:            layout
generic:         false

role:            Template de route Next.js. Remonte à chaque navigation et
                 applique un fade-in court (150 ms) au contenu, pour adoucir
                 les changements de page. Respecte prefers-reduced-motion
                 via MotionConfig. Aucune logique métier.

flow:            Template({ children }) → MotionConfig reducedMotion="user"
                 → motion.div initial opacity 0 → animate opacity 1,
                 duration 0.15 → {children}.

ecosystem:       Socle = [
                   "@/app/globals.css",
                   "@/app/layout.tsx",
                   "@/app/page.tsx",
                   "@/app/template.tsx",
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                 ]
relatedFiles:    ["@/app/layout.tsx"]
imports:         ["motion/react"]
exports:         ["default Template"]
useBy:           ["@/app/layout.tsx"]

userStories:     ["*en tant qu'utilisateur je veux des transitions douces entre les pages"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import { motion, MotionConfig } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex flex-1 flex-col"
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}