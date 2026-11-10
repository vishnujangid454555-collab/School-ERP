import { useState } from 'react';
import { MENU_GROUPS, menuPath } from '../navigation/menu.js';

function MenuIcon({ name }) {
  return <span className={`menu-icon menu-icon-${name}`} aria-hidden="true" />;
}

export default function Sidebar({ pathname, onNavigate, isOpen, onClose }) {
  const activeGroup = MENU_GROUPS.find((group) => group.items.some((menuItem) => menuPath(group, menuItem) === pathname)) || MENU_GROUPS[0];
  const [expandedGroup, setExpandedGroup] = useState(activeGroup.key);

  const toggleGroup = (groupKey) => {
    setExpandedGroup((current) => current === groupKey ? null : groupKey);
  };

  return (
    <>
      <button className={`sidebar-backdrop${isOpen ? ' is-visible' : ''}`} type="button" aria-label="Close navigation" onClick={onClose} />
      <aside className={`app-sidebar${isOpen ? ' is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <span className="brand-mark">School ERP</span>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close navigation">×</button>
        </div>
        <div className="sidebar-scroll">
          {MENU_GROUPS.map((group) => {
            const isExpanded = expandedGroup === group.key;
            const hasActiveItem = group.key === activeGroup.key;
            return (
              <section className={`menu-group${hasActiveItem ? ' has-active' : ''}`} key={group.key}>
                <button type="button" className="menu-group-toggle" onClick={() => toggleGroup(group.key)} aria-expanded={isExpanded}>
                  <MenuIcon name={group.icon} />
                  <span>{group.label}</span>
                  <span className={`menu-chevron${isExpanded ? ' is-expanded' : ''}`} aria-hidden="true">›</span>
                </button>
                {isExpanded && (
                  <div className="submenu">
                    {group.items.map((menuItem) => {
                      const path = menuPath(group, menuItem);
                      return (
                        <button
                          type="button"
                          className={`submenu-item${path === pathname ? ' is-active' : ''}`}
                          key={path}
                          onClick={() => {
                            setExpandedGroup(group.key);
                            onNavigate(path);
                          }}
                        >
                          {menuItem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </aside>
    </>
  );
}
