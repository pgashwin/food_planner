import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/pantry', label: 'Pantry', icon: '🥫' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Food Planner</h1>
        <p className="tagline">What&apos;s for the next meal?</p>
      </header>

      <main className="app-main">{children}</main>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
