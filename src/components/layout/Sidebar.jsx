import { memo } from 'react';
import { NavLink } from 'react-router-dom';

// ✅ Hoisted: static data, allocated once
const LINKS = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products', end: true },
  { to: '/products/new', label: 'Add Product', end: true },
];

// ✅ Hoisted: reusable className builder
const linkClassName = ({ isActive }) =>
  `block px-3 py-2 rounded-md text-sm font-medium ${
    isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-gray-700 hover:bg-gray-100'
  }`;

// ✅ Hoisted: static SVG — extracted so it's not re-created in the main render
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Sidebar = ({ open, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-60 bg-white border-r border-gray-200 transform transition-transform duration-200 overflow-y-auto ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Sidebar navigation"
      >
        {/* X close button — mobile only */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="md:hidden absolute top-3 right-3 p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <CloseIcon />
        </button>

        {/* Brand/title — mobile only */}
        <div className="md:hidden px-4 pt-4 pb-2 border-b border-gray-100">
          <span className="font-bold text-blue-700">Menu</span>
        </div>

        <nav className="p-4 space-y-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={linkClassName}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default memo(Sidebar);