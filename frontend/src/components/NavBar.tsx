import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CartIcon from './CartIcon';
import ActionButton from './ui/ActionButton';
import Logo from './Logo';
import './NavBar.css';

const links = [
  { to: '/', label: 'Marketplace', end: true },
  { to: '/verify', label: 'Verify Product' },
  { to: '/trust-center', label: 'Trust Center' },
  { to: '/compare', label: 'Compare' },
  { to: '/complaints', label: 'Reports' },
];

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.search as HTMLInputElement;
    const query = input.value.trim();
    if (query) {
      navigate(`/verify?serial=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => navigate('/')} type="button" aria-label="VeriChain Home">
        <Logo size={36} showText={true} />
      </button>

      <button className="navbar-menu" onClick={() => setOpen(!open)} type="button" aria-label="Toggle navigation">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`navbar-panel ${open ? 'navbar-panel-open' : ''}`}>
        <ul className="navbar-links">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <form className="navbar-search" onSubmit={handleSearch}>
          <Search size={16} />
          <input type="text" name="search" placeholder="Serial or product ID" />
        </form>

        <div className="navbar-actions">
          <CartIcon />
          {user ? (
            <>
              <ActionButton variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>Dashboard</ActionButton>
              <ActionButton variant="ghost" size="sm" onClick={logout}>Logout</ActionButton>
            </>
          ) : (
            <>
              <ActionButton variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</ActionButton>
              <ActionButton variant="primary" size="sm" onClick={() => navigate('/signup')}>Get Started</ActionButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
