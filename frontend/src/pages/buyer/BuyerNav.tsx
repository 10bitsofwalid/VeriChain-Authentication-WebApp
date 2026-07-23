import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, CreditCard, Package, Heart, User, History } from 'lucide-react';
import { mockCartItems, mockOrders, mockWishlist } from './mockData';
import './BuyerExperience.css';

interface BuyerNavProps {
  cartCount?: number;
  wishlistCount?: number;
}

export default function BuyerNav({ cartCount = mockCartItems.reduce((acc, item) => acc + item.quantity, 0), wishlistCount = mockWishlist.length }: BuyerNavProps) {
  const activeOrdersCount = mockOrders.filter(o => ['processing', 'shipped'].includes(o.status)).length;

  const navItems = [
    { to: '/buyer/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { to: '/buyer/checkout', label: 'Checkout', icon: CreditCard },
    { to: '/buyer/orders', label: 'Orders', icon: Package, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
    { to: '/buyer/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount > 0 ? wishlistCount : undefined },
    { to: '/buyer/profile', label: 'Profile', icon: User },
    { to: '/buyer/purchase-history', label: 'Purchase History', icon: History },
  ];

  return (
    <nav className="bx-subnav" aria-label="Buyer Experience Sub-navigation">
      <div className="bx-subnav-list">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bx-subnav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="bx-subnav-badge">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
