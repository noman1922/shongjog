"use client";

import { Plus, Sparkles, X } from "lucide-react";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

import type { SkillOption } from "@/lib/onboarding/options";

interface SkillTagInputProps {
  availableSkills?: SkillOption[];
  value: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  error?: string;
}

export function SkillTagInput({
  availableSkills = [],
  value = [],
  onChange,
  maxSkills = 25,
  error,
}: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const normalizedSelected = useMemo(
    () => value.map((v) => v.toLowerCase().trim()),
    [value]
  );

  const filteredSuggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) {
      return availableSkills
        .filter((s) => !normalizedSelected.includes(s.name.toLowerCase()))
        .slice(0, 8);
    }

    return availableSkills
      .filter(
        (s) =>
          s.name.toLowerCase().includes(query) &&
          !normalizedSelected.includes(s.name.toLowerCase())
      )
      .slice(0, 8);
  }, [availableSkills, inputValue, normalizedSelected]);

  const isExactMatch = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    return availableSkills.some((s) => s.name.toLowerCase() === query);
  }, [availableSkills, inputValue]);

  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (value.length >= maxSkills) return;

    if (!normalizedSelected.includes(trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
    }

    setInputValue("");
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const removeSkill = (indexToRemove: number) => {
    const updated = value.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (isOpen && focusedIndex >= 0 && filteredSuggestions[focusedIndex]) {
        addSkill(filteredSuggestions[focusedIndex].name);
      } else if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      e.preventDefault();
      removeSkill(value.length - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      }
      setFocusedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <div className="space-y-2.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label
          className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5"
          htmlFor={inputId}
        >
          <span>Skills & Expertise</span>
          <span className="text-[11px] font-normal text-muted-foreground">
            (Optional · {value.length}/{maxSkills})
          </span>
        </label>
        {value.length > 0 && (
          <button
            className="text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            onClick={() => onChange([])}
            type="button"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Tag Box & Input */}
      <div
        className={`min-h-12 w-full rounded-xl border p-2 transition-all duration-200 bg-muted/40 dark:bg-slate-800/60 flex flex-wrap items-center gap-1.5 focus-within:border-primary focus-within:bg-card dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/20 ${
          error
            ? "border-destructive/60"
            : "border-border/80 dark:border-slate-700"
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Selected Skill Badges */}
        {value.map((skill, index) => (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 px-3 py-1 text-xs font-semibold shadow-xs animate-in fade-in zoom-in-95 duration-150"
            key={`${skill}-${index}`}
          >
            <span>{skill}</span>
            <button
              aria-label={`Remove skill ${skill}`}
              className="rounded-full p-0.5 hover:bg-primary/20 hover:text-primary dark:hover:text-white transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(index);
              }}
              type="button"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        {/* Text Input */}
        <div className="relative flex-1 min-w-[160px]">
          <input
            autoComplete="off"
            className="w-full bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={value.length >= maxSkills}
            id={inputId}
            onBlur={() => {
              // Delay close so click on dropdown item works
              setTimeout(() => setIsOpen(false), 200);
            }}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setFocusedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              value.length >= maxSkills
                ? "Max skills reached"
                : value.length === 0
                ? "Type a skill (e.g. React, Python, UI/UX) and press Enter..."
                : "Add another skill..."
            }
            ref={inputRef}
            type="text"
            value={inputValue}
          />
        </div>

        {/* Add Button for explicit click */}
        {inputValue.trim() && value.length < maxSkills && (
          <button
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              addSkill(inputValue);
            }}
            type="button"
          >
            <Plus className="size-3" />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && (filteredSuggestions.length > 0 || (inputValue.trim() && !isExactMatch)) && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 max-h-60 overflow-y-auto rounded-xl border border-border/80 dark:border-slate-700 bg-popover p-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
            {/* If user typed something not in predefined list, show custom add option */}
            {inputValue.trim() && !isExactMatch && (
              <button
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs sm:text-sm rounded-lg transition-colors cursor-pointer ${
                  focusedIndex === -1
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addSkill(inputValue);
                }}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>
                    Add custom skill: <strong className="underline decoration-primary">{inputValue.trim()}</strong>
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Enter ↵
                </span>
              </button>
            )}

            {filteredSuggestions.map((suggestion, index) => (
              <button
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs sm:text-sm rounded-lg transition-colors cursor-pointer ${
                  focusedIndex === index
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
                key={suggestion.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addSkill(suggestion.name);
                }}
                type="button"
              >
                <span>{suggestion.name}</span>
                <Plus className="size-3.5 text-muted-foreground opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {error ? (
        <p className="text-xs text-destructive font-medium">{error}</p>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Select from autocomplete or type any custom skill and press{" "}
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>
        </p>
      )}
    </div>
  );
}
