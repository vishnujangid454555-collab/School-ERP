import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const actionIcons = {
  complete: <><path d="m5 12 4 4L19 6" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10" /></>,
  delete: <><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M5 7l1 14h12l1-14M9 7V4h6v3" /></>,
  edit: <><path d="m15 5 4 4" /><path d="M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" /></>,
  followup: <><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" /><path d="M16 3h5v5M21 3l-9 9" /><path d="M7 8h4M7 12h3M7 16h2" /></>,
};

function ActionIcon({ name }) {
  return <svg className="action-menu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {actionIcons[name] || <><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></>}
  </svg>;
}

export default function ActionMenu({ label = 'record', actions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const margin = 8;
    const left = Math.min(Math.max(trigger.right - menu.width, margin), window.innerWidth - menu.width - margin);
    const below = trigger.bottom + menu.height + margin <= window.innerHeight;
    const top = below
      ? trigger.bottom + 5
      : Math.max(margin, trigger.top - menu.height - 5);
    setPosition({ left, top });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const dismiss = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'pointerdown' && (triggerRef.current?.contains(event.target) || menuRef.current?.contains(event.target))) return;
      setIsOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', dismiss);
    document.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [isOpen]);

  const selectAction = (action) => {
    setIsOpen(false);
    action.onSelect();
  };

  const handleMenuKeyDown = (event) => {
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]:not(:disabled)') || [])];
    const index = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      items[(index + direction + items.length) % items.length]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      items[event.key === 'Home' ? 0 : items.length - 1]?.focus();
    }
  };

  return <span className="action-menu">
    <button
      ref={triggerRef}
      className="action-menu-trigger"
      type="button"
      aria-label={`Actions for ${label}`}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={() => { setPosition(null); setIsOpen((open) => !open); }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="m19.4 13.5 1.4 1.1-1.6 2.8-1.7-.7a7.9 7.9 0 0 1-1.6.9l-.3 1.8h-3.2l-.3-1.8a7.9 7.9 0 0 1-1.6-.9l-1.7.7-1.6-2.8 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.6-2.8 1.7.7a7.9 7.9 0 0 1 1.6-.9l.3-1.8h3.2l.3 1.8a7.9 7.9 0 0 1 1.6.9l1.7-.7 1.6 2.8-1.4 1.1a7 7 0 0 1 0 1.9ZM14 15.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
      <span className="action-menu-chevron" aria-hidden="true" />
    </button>
    {isOpen && createPortal(
      <div
        ref={menuRef}
        className="action-menu-popover"
        role="menu"
        aria-label={`${label} actions`}
        style={position ? { left: position.left, top: position.top, visibility: 'visible' } : undefined}
        onKeyDown={handleMenuKeyDown}
      >
        {actions.map((action) => <button
          className={`action-menu-item${action.danger ? ' is-danger' : ''}`}
          type="button"
          role="menuitem"
          key={action.label}
          disabled={action.disabled}
          onClick={() => selectAction(action)}
        >
          <ActionIcon name={action.icon} />
          <span>{action.label}</span>
        </button>)}
      </div>,
      document.body,
    )}
  </span>;
}
