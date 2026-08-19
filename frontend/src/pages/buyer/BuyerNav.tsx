import { NavLink } from 'react-router-dom';
import {
  IconShoppingCart as ShoppingCart,
  IconCreditCard as CreditCard,
  IconPackage as Package,
  IconHeart as Heart,
  IconUser as User,
  IconHistory as History,
} from '@tabler/icons-react';
import { useShopping } from '../../context/ShoppingContext';
import './BuyerExperience.css';

interface BuyerNavProps {
  cartCount?: number;
  wishlistCount?: number;
}

export default function BuyerNav({ cartCount, wishlistCount }: BuyerNavProps) {
  const { cart, wishlist } = useShopping();

  const realCartCount = cartCount ?? cart.reduce((acc, item) => acc + (item.quantity ?? 1), 0);
  const realWishlistCount = wishlistCount ?? wishlist.length;

  const navItems = [
    { to: '/buyer/cart', label: 'Cart', icon: ShoppingCart, badge: realCartCount > 0 ? realCartCount : undefined },
    { to: '/buyer/checkout', label: 'Checkout', icon: CreditCard },
    { to: '/buyer/orders', label: 'Orders', icon: Package },
    { to: '/buyer/wishlist', label: 'Wishlist', icon: Heart, badge: realWishlistCount > 0 ? realWishlistCount : undefined },
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
