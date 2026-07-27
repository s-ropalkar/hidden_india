/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Palette, X } from 'lucide-react';
import * as api from '../api';

interface CraftMultiFilterProps {
  selected: string[];
  onChange: (crafts: string[]) => void;
  label?: string;
}

export default function CraftMultiFilter({ selected, onChange, label = 'Crafts' }: CraftMultiFilterProps) {
  const [open, setOpen] = useState(false);
  const [crafts, setCrafts] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getCatalogCrafts().then(setCrafts).catch(() => setCrafts([]));
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle = (craft: string) => {
    if (selected.includes(craft)) {
      onChange(selected.filter((c) => c !== craft));
    } else {
      onChange([...selected, craft]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-surface-container-high border border-outline-variant/30 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold"
      >
        <Palette size={13} className="text-primary" />
        <span className="text-on-surface font-bold text-xs max-w-[140px] truncate">
          {selected.length === 0 ? `All ${label}` : `${selected.length} selected`}
        </span>
        <ChevronDown size={12} className="text-on-surface-variant" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-64 max-h-56 overflow-y-auto bg-surface border border-outline-variant/30 rounded-xl shadow-lg p-2">
          {crafts.length === 0 ? (
            <p className="text-xs text-on-surface-variant p-2 italic">Loading crafts...</p>
          ) : (
            crafts.map((craft) => (
              <label
                key={craft}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-container-high cursor-pointer text-xs font-sans"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(craft)}
                  onChange={() => toggle(craft)}
                  className="accent-primary"
                />
                <span className="line-clamp-1">{craft}</span>
              </label>
            ))
          )}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full mt-1 text-[10px] font-bold uppercase text-primary py-1.5 flex items-center justify-center gap-1"
            >
              <X size={10} /> Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
