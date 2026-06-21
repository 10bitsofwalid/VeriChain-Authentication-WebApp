import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

const NavBar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">VeriChain</div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : undefined}>Home</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : undefined}>Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/marketplace" className={({ isActive }) => isActive ? 'active' : undefined}>Marketplace</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
