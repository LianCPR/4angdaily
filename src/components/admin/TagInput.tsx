"use client";

import { useState } from "react";

export function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !value.includes(tag) && value.length < 10) {
      onChange([...value, tag]);
    }
    setDraft("");
  }

  return (
    <div>
      <label className="field-label">Tags</label>
      <div className="flex flex-wrap items-center gap-2 rounded-sm border border-line bg-paper-soft px-3 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-paper-deep px-2.5 py-1 text-xs text-ink-soft"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-ink-faint hover:text-accent-rust"
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={value.length === 0 ? "Add a tag and press Enter" : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
    </div>
  );
}
