import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, X } from 'lucide-react';

type DateTimePickerProps = {
  type: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  ariaLabel?: string;
  placeholder?: string;
};

type PickerPosition = {
  top: number;
  left: number;
  width: number;
};

const pad = (value: number) => String(value).padStart(2, '0');

const dateToValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseDateValue = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[3])
    ? date
    : null;
};

const parseTimeValue = (value: string) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
};

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  type,
  value,
  onChange,
  className = 'w-full',
  required = false,
  ariaLabel,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [position, setPosition] = useState<PickerPosition | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(type === 'date' ? 312 : 292, Math.max(0, window.innerWidth - 16));
    const height = type === 'date' ? 390 : 424;
    const below = rect.bottom + 8;
    const top = below + height <= window.innerHeight
      ? below
      : Math.max(8, rect.top - height - 8);
    setPosition({
      top,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      width,
    });
  }, [type]);

  const openPicker = useCallback(() => {
    if (type === 'date') {
      const selectedDate = parseDateValue(value) ?? new Date();
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
    setIsOpen(true);
  }, [type, value]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  const selectedDate = parseDateValue(value);
  const selectedTime = parseTimeValue(value);
  const todayValue = dateToValue(new Date());
  const monthCells = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const cellCount = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - firstDay + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    });
  }, [visibleMonth]);

  useEffect(() => {
    if (!isOpen || type !== 'time') return;
    requestAnimationFrame(() => {
      hourListRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'center' });
      minuteListRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'center' });
    });
  }, [isOpen, type, value]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      openPicker();
      return;
    }
    if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  const formatMonth = (date: Date) =>
    new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date);
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(2023, 0, index + 1))
  );

  const changeMonth = (offset: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  const chooseDate = (day: number) => {
    onChange(dateToValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)));
    setIsOpen(false);
  };

  const chooseHour = (hour: number) => {
    const minute = selectedTime?.minute ?? 0;
    onChange(`${pad(hour)}:${pad(minute)}`);
  };

  const chooseMinute = (minute: number) => {
    const hour = selectedTime?.hour ?? new Date().getHours();
    onChange(`${pad(hour)}:${pad(minute)}`);
  };

  const clearValue = () => {
    onChange('');
    setIsOpen(false);
  };

  const picker = isOpen && position && (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={type === 'date' ? 'Choose a date' : 'Choose a time'}
      style={{ position: 'fixed', top: position.top, left: position.left, width: position.width, zIndex: 1000 }}
      className="max-h-[calc(100vh-16px)] overflow-y-auto rounded-2xl border border-theme bg-modal-theme p-4 text-primary-theme shadow-2xl"
    >
      {type === 'date' ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-theme">Select date</p>
              <h3 className="mt-1 text-lg font-semibold">{formatMonth(visibleMonth)}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="rounded-lg p-2 text-secondary-theme transition-colors hover:bg-card-hover hover:text-primary-theme"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="rounded-lg p-2 text-secondary-theme transition-colors hover:bg-card-hover hover:text-primary-theme"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((weekday, index) => (
              <span key={`${weekday}-${index}`} className="py-1 text-center text-[10px] font-semibold uppercase text-muted-theme">
                {weekday}
              </span>
            ))}
            {monthCells.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const dateValue = dateToValue(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
              const isSelected = dateValue === value;
              const isToday = dateValue === todayValue;
              return (
                <button
                  key={dateValue}
                  type="button"
                  onClick={() => chooseDate(day)}
                  aria-label={formatDate(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day))}
                  aria-pressed={isSelected}
                  className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-accent-theme text-white shadow-sm'
                      : `text-primary-theme hover:bg-card-hover ${isToday ? 'ring-1 ring-accent-theme' : ''}`
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-theme pt-3">
            {!required && value ? (
              <button type="button" onClick={clearValue} className="text-xs font-medium text-secondary-theme hover:text-primary-theme">
                Clear
              </button>
            ) : <span />}
            <button
              type="button"
              onClick={() => {
                onChange(todayValue);
                setIsOpen(false);
                const now = new Date();
                setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
              }}
              className="rounded-lg bg-card-hover px-3 py-1.5 text-xs font-semibold text-accent-theme transition-colors hover:opacity-80"
            >
              Today
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-theme bg-card-theme px-3.5 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-card-hover p-2 text-accent-theme"><Clock3 className="h-4 w-4" /></span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary-theme">Selected time</p>
                <p className="text-xl font-semibold tracking-wide">{value || '--:--'}</p>
              </div>
            </div>
            {!required && value && (
              <button type="button" onClick={clearValue} className="rounded-lg p-2 text-secondary-theme hover:bg-card-hover hover:text-primary-theme" aria-label="Clear time">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary-theme">Hour</p>
              <div ref={hourListRef} className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-theme bg-input-theme p-1.5">
                {Array.from({ length: 24 }, (_, hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => chooseHour(hour)}
                    aria-label={`Hour ${pad(hour)}`}
                    aria-pressed={selectedTime?.hour === hour}
                    className={`w-full rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                      selectedTime?.hour === hour ? 'bg-accent-theme text-white' : 'text-primary-theme hover:bg-card-hover'
                    }`}
                  >
                    {pad(hour)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary-theme">Minute</p>
              <div ref={minuteListRef} className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-theme bg-input-theme p-1.5">
                {Array.from({ length: 60 }, (_, minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => chooseMinute(minute)}
                    aria-label={`Minute ${pad(minute)}`}
                    aria-pressed={selectedTime?.minute === minute}
                    className={`w-full rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                      selectedTime?.minute === minute ? 'bg-accent-theme text-white' : 'text-primary-theme hover:bg-card-hover'
                    }`}
                  >
                    {pad(minute)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-theme pt-3">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
              }}
              className="text-xs font-medium text-secondary-theme hover:text-primary-theme"
            >
              Use current time
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-accent-theme px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div ref={triggerRef} className={`relative rounded-xl focus-within:ring-2 focus-within:ring-accent-theme ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border border-theme bg-input-theme px-3.5 py-2 text-sm text-primary-theme transition-colors"
      >
        <span className={`flex min-w-0 items-center gap-2.5 truncate ${value ? '' : 'text-muted-theme'}`}>
          {type === 'date' ? <CalendarDays className="h-4 w-4 shrink-0 text-accent-theme" /> : <Clock3 className="h-4 w-4 shrink-0 text-accent-theme" />}
          <span className="truncate">
            {type === 'date'
              ? selectedDate ? formatDate(selectedDate) : placeholder ?? 'Choose date'
              : value || placeholder || 'Choose time'}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-secondary-theme" />
      </div>
      <input
        type="text"
        value={value}
        required={required}
        aria-label={ariaLabel ?? (type === 'date' ? 'Choose date' : 'Choose time')}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        autoComplete="off"
        inputMode="none"
        spellCheck={false}
        onFocus={openPicker}
        onClick={openPicker}
        onKeyDown={handleInputKeyDown}
        onChange={(event) => event.preventDefault()}
        onPaste={(event) => event.preventDefault()}
        className="absolute inset-0 h-full w-full cursor-pointer rounded-xl opacity-0"
      />
      {picker && createPortal(picker, document.body)}
    </div>
  );
};
