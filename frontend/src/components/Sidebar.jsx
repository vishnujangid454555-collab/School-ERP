import { useMemo, useState } from 'react';
import { MENU_GROUPS, menuPath } from '../navigation/menu.js';

function MenuIcon({ name }) {
  return <span className={`menu-icon menu-icon-${name}`} aria-hidden="true" />;
}

export default function Sidebar({ pathname, onNavigate, isOpen, onClose }) {
  const activeGroup = MENU_GROUPS.find((group) => group.items.some((menuItem) => menuPath(group, menuItem) === pathname)) || MENU_GROUPS[0];
  const [expanded, setExpanded] = useState(() => new Set([activeGroup.key]));
  const [query, setQuery] = useState('');
  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return MENU_GROUPS.map((group) => ({ ...group, visibleItems: group.items }));
    return MENU_GROUPS.map((group) => {
      const groupMatches = group.label.toLowerCase().includes(normalizedQuery);
      const visibleItems = groupMatches ? group.items : group.items.filter((menuItem) => menuItem.label.toLowerCase().includes(normalizedQuery));
      return { ...group, visibleItems };
    }).filter((group) => group.visibleItems.length);
  }, [query]);

  const toggleGroup = (groupKey) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  return (
    <>
      <button className={`sidebar-backdrop${isOpen ? ' is-visible' : ''}`} type="button" aria-label="Close navigation" onClick={onClose} />
      <aside className={`app-sidebar${isOpen ? ' is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <span className="brand-mark">School ERP</span>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close navigation">×</button>
        </div>
        <div className="sidebar-search"><input type="search" aria-label="Filter navigation" placeholder="Find a workspace..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <div className="sidebar-scroll">
          {visibleGroups.map((group) => {
            const isExpanded = Boolean(query.trim()) || expanded.has(group.key);
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
                    {group.visibleItems.map((menuItem) => {
                      const path = menuPath(group, menuItem);
                      return (
                        <button
                          type="button"
                          className={`submenu-item${path === pathname ? ' is-active' : ''}`}
                          key={path}
                          onClick={() => {
                            setExpanded((current) => new Set(current).add(group.key));
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
          {visibleGroups.length === 0 && <div className="sidebar-no-results">No matching workspace</div>}
        </div>
      </aside>
    </>
  );
}
