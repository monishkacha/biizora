import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus } from 'lucide-react';

/**
 * Enterprise Searchable Grouped Select Component
 * Supports grouped options, live filtering, keyboard nav, click-outside,
 * quick suggestion pills, and custom write-in values.
 */
export function SearchableGroupedSelect({
  value,
  onChange,
  groups = [],
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  suggestions = [],
  className = '',
  allowCustom = true,
  customPlaceholder = 'Enter custom value...',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter groups based on search term
  const filteredGroups = groups
    .map((group) => {
      const filteredOptions = group.options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
      );
      return { ...group, options: filteredOptions };
    })
    .filter((group) => group.options.length > 0);

  const handleSelectOption = (option) => {
    if (option.includes('Custom') || option.includes('Other')) {
      setIsCustomMode(true);
      setIsOpen(false);
    } else {
      setIsCustomMode(false);
      onChange(option);
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customValue.trim()) {
      onChange(customValue.trim());
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Main Select Button Trigger */}
      {!isCustomMode ? (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3.5 py-2.5 rounded-[14px] border border-stone bg-white text-sm text-charcoal flex items-center justify-between shadow-xs hover:border-green-bottle/40 focus:outline-none transition-all"
          >
            <span className="truncate font-medium">
              {value || <span className="text-stone-400">{placeholder}</span>}
            </span>
            <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick Suggestion Pills */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray">Quick:</span>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange(sug)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-mono border transition-all ${
                    value === sug
                      ? 'bg-green-bottle text-white border-green-bottle font-bold'
                      : 'bg-stone-100 hover:bg-stone-200 text-charcoal border-stone-200'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Custom Input Mode */
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customValue}
              onChange={(e) => {
                setCustomValue(e.target.value);
                onChange(e.target.value);
              }}
              placeholder={customPlaceholder}
              className="bz-input font-medium text-xs flex-1"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className="text-xs text-green-bottle font-semibold hover:underline"
            >
              Select List
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden max-h-72 flex flex-col">
          {/* Search Header */}
          <div className="p-2 border-b border-stone-100 bg-stone-50/80 sticky top-0 z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-green-bottle/50"
                autoFocus
              />
            </div>
          </div>

          {/* Grouped Options List */}
          <div className="overflow-y-auto p-1 text-xs divide-y divide-stone-100">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group, idx) => (
                <div key={idx} className="py-1.5">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-warm-gray bg-stone-50/50 rounded-md">
                    {group.label}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {group.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-medium transition-colors ${
                          value === opt
                            ? 'bg-green-bottle/10 text-green-bottle font-bold'
                            : 'hover:bg-stone-100 text-charcoal'
                        }`}
                      >
                        <span>{opt}</span>
                        {value === opt && <Check className="w-3.5 h-3.5 text-green-bottle" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-warm-gray text-xs">
                No matching options found.
              </div>
            )}

            {/* Custom Write-In Entry Option */}
            {allowCustom && (
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(true);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-green-bottle font-bold flex items-center gap-1.5 hover:bg-green-bottle/5"
              >
                <Plus className="w-3.5 h-3.5" /> Enter Custom Value...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
