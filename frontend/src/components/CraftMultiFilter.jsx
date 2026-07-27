import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Palette, X } from 'lucide-react';
import * as api from '../api';

export default function CraftMultiFilter({ selected, onChange, label = 'Crafts' }) {
  const [open, setOpen] = useState(false);
  const [crafts, setCrafts] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    api.getCatalogCrafts().then(setCrafts).catch(() => setCrafts([]));
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle = (craft) => {
    if (selected.includes(craft)) {
      onChange(selected.filter(c => c !== craft));
    } else {
      onChange([...selected, craft]);
    }
  };

  return (
    <div className="craft-filter-wrap" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="craft-filter-btn"
      >
        <Palette size={13} className="text-primary" />
        <span>
          {selected.length === 0 ? `All ${label}` : `${selected.length} selected`}
        </span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="craft-filter-dropdown">
          {crafts.length === 0 ? (
            <p className="craft-filter-empty">Loading crafts...</p>
          ) : (
            crafts.map(craft => (
              <label key={craft} className="craft-filter-option">
                <input
                  type="checkbox"
                  checked={selected.includes(craft)}
                  onChange={() => toggle(craft)}
                  className="craft-filter-checkbox"
                />
                <span>{craft}</span>
              </label>
            ))
          )}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="craft-filter-clear"
            >
              <X size={10} /> Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
