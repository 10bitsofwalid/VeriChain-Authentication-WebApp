import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartIcon from '../components/CartIcon';
import './NavBar.css';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.search as HTMLInputElement;
    const query = input.value.trim();
    if (query) {
      // For now, navigate to marketplace with query as URL param
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">VeriChain</div>
      <ul className="navbar-links">
        <li><NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>Home</NavLink></li>
        <li><NavLink to="/marketplace" className={({ isActive }) => (isActive ? 'active' : undefined)}>Marketplace</NavLink></li>
        <li><NavLink to="/verify" className={({ isActive }) => (isActive ? 'active' : undefined)}>Verify Product</NavLink></li>
        <li><NavLink to="/categories" className={({ isActive }) => (isActive ? 'active' : undefined)}>Categories</NavLink></li>
        {user ? (
          <>
            <li><NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : undefined)}>Notifications</NavLink></li>
            <li><NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>Dashboard</NavLink></li>
            <li><NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : undefined)}>Profile</NavLink></li>
            <li><button className="logout-btn" onClick={logout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : undefined)}>Login</NavLink></li>
            <li><NavLink to="/signup" className={({ isActive }) => (isActive ? 'active' : undefined)}>Register</NavLink></li>
          </>
        )}
      </ul>
      <CartIcon />
      <form className="navbar-search" onSubmit={handleSearch}>
        <input type="text" name="search" placeholder="Search products..." />
        <button type="submit">Search</button>
      </form>
    </nav>
  );
};

export default NavBar;
