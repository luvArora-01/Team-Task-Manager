import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavIcon = ({ type }) => {
  const icons = {
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </svg>
    ),
    projects: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7.5A2.5 2.5 0 016.5 5h4l2 2h5A2.5 2.5 0 0120 9.5v6A2.5 2.5 0 0117.5 18h-11A2.5 2.5 0 014 15.5v-8z" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 20v-1.5A3.5 3.5 0 0012.5 15h-5A3.5 3.5 0 004 18.5V20" />
        <circle cx="10" cy="8" r="3.5" />
        <path d="M18 10.5a3 3 0 000-5.7M20 20v-1a3 3 0 00-2-2.83" />
      </svg>
    ),
    profile: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 20v-1.5A4.5 4.5 0 0014.5 14h-5A4.5 4.5 0 005 18.5V20" />
        <circle cx="12" cy="7.5" r="3.5" />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 20H6.5A2.5 2.5 0 014 17.5v-11A2.5 2.5 0 016.5 4H9" />
        <path d="M15 16l4-4-4-4M19 12H9" />
      </svg>
    ),
  };
  return icons[type] || null;
};

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">TTM</div>
          <div>
            <span className="sidebar-logo-text">Team Task Manager</span>
            <span className="sidebar-logo-subtitle">Future Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Workspace</div>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <NavIcon type="dashboard" /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <NavIcon type="projects" /> Projects
          </NavLink>

          {isAdmin && (
            <>
              <div className="sidebar-section-title">Governance</div>
              <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <NavIcon type="users" /> Users
              </NavLink>
            </>
          )}

          <div className="sidebar-section-title">Account</div>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <NavIcon type="profile" /> Profile
          </NavLink>
          <button className="sidebar-link" onClick={handleLogout}>
            <NavIcon type="logout" /> Logout
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
      </aside>

      <div className={`sidebar-backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <button
        className="mobile-fab"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      <main className="main-content">
        <Outlet context={{ openSidebar: () => setOpen(true) }} />
      </main>
    </div>
  );
}
