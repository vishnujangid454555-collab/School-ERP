import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Login from './components/Login.jsx';
import ResourceWorkspace from './components/ResourceWorkspace.jsx';
import DashboardWorkspace from './components/DashboardWorkspace.jsx';
import AttendanceWorkspace from './components/AttendanceWorkspace.jsx';
import StudentImportWorkspace from './components/StudentImportWorkspace.jsx';
import AdmissionFollowUpWorkspace from './components/AdmissionFollowUpWorkspace.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { findMenuItem } from './navigation/menu.js';
import './styles/theme.css';

export default function App() {
  const { token, user, logout } = useAuth();
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const routedPathname = token
    ? pathname === '/login' || pathname === '/' ? '/dashboard/dashboard' : pathname
    : '/login';
  const { group, item: activeItem } = findMenuItem(routedPathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (routedPathname !== window.location.pathname) {
      window.history.replaceState({}, '', routedPathname);
    }
  }, [routedPathname]);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setPathname(path);
    setIsSidebarOpen(false);
  };

  if (!token) return <Login />;

  return (
    <div className="app-shell">
      <Sidebar pathname={routedPathname} onNavigate={navigate} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="app-main">
        <header className="app-header">
          <button type="button" className="menu-toggle" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation">☰</button>
          <div className="header-context">
            <span className="header-kicker">{group.label}</span>
            <strong>{activeItem.label}</strong>
          </div>
          <div className="header-account"><span className="header-account-avatar" aria-hidden="true">{(user?.name || user?.email || 'S').slice(0, 1).toUpperCase()}</span><span className="header-account-name">{user?.name || user?.email || 'School team'}</span><button type="button" className="secondary-button header-logout" onClick={logout}>Sign out</button></div>
        </header>
        <main className="workspace">
          <div className="workspace-heading">
            <div>
              <span className="eyebrow">{group.label}</span>
              <h1>{activeItem.label}</h1>
            </div>
          </div>
          {group.key === 'dashboard' ? <DashboardWorkspace onNavigate={navigate} /> : group.key === 'admission' && activeItem.slug === 'enquiry-follow-up' ? <AdmissionFollowUpWorkspace /> : group.key === 'attendance' && activeItem.slug === 'student-attendance' ? <AttendanceWorkspace /> : group.key === 'student-master' && activeItem.slug === 'student-import' ? <StudentImportWorkspace /> : <ResourceWorkspace key={routedPathname} group={group} item={activeItem} />}
        </main>
      </div>
    </div>
  );
}
