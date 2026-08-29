"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export type ColorOption = {
  label: string;
  value: string;
  bgClass: string;
};

type ColorPickerProps = {
  colors: ColorOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ColorPicker({ colors, value, onChange, disabled }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedColor = colors.find(c => c.value === value) || colors[0];

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-xl border border-white/[0.08] bg-zinc-900/80
          transition-colors hover:border-white/[0.15]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className={`w-4 h-4 rounded-full shadow-[0_0_8px] ${selectedColor?.bgClass || 'bg-zinc-500'}`} />
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="absolute z-20 top-full mt-2 left-0 p-2.5 bg-zinc-950/90 border border-white/[0.12] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.5)] backdrop-blur-2xl flex gap-2 w-max max-w-[200px] flex-wrap"
          >
            {colors.map((c) => {
              const isSelected = value === c.value;
              return (
                <motion.button
                  key={c.value}
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onChange(c.value);
                    setIsOpen(false);
                  }}
                  title={c.label}
                  className={`
                    relative w-6 h-6 rounded-full transition-all 
                    flex items-center justify-center
                    ${c.bgClass} 
                    cursor-pointer
                    ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : 'border border-white/20'}
                  `}
                >
                  {isSelected && <Check className="w-3 h-3 text-white drop-shadow-md stroke-[3]" />}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
