"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 p-1.5 rounded-lg border border-zinc-800 bg-zinc-950
          transition-colors hover:bg-zinc-900
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className={`w-5 h-5 rounded-full ${selectedColor?.bgClass || 'bg-zinc-500'}`} />
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 top-full mt-2 left-0 p-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl flex gap-2 w-max max-w-[200px] flex-wrap">
          {colors.map((c) => {
            const isSelected = value === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => {
                  onChange(c.value);
                  setIsOpen(false);
                }}
                title={c.label}
                className={`
                  relative w-7 h-7 rounded-full transition-all duration-200 
                  flex items-center justify-center
                  ${c.bgClass} 
                  hover:scale-110 cursor-pointer
                  ${isSelected ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-zinc-400' : 'border border-zinc-700'}
                `}
              >
                {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
