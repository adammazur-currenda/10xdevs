import React from "react";

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavigationProps {
  items: NavItem[];
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ items, className = "" }) => (
  <nav className={className}>
    <ul className="flex space-x-4">
      {items.map((item, index) => (
        <li key={index}>
          <a
            href={item.href}
            className={`px-3 py-2 ${item.active ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-700 hover:text-blue-500"}`}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

export default Navigation;
