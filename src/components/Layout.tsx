import React from "react";

interface LayoutProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ header, footer, children, className = "" }) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {header && <header className="bg-gray-100 p-4">{header}</header>}
      <main className="flex-grow p-4">{children}</main>
      {footer && <footer className="bg-gray-100 p-4">{footer}</footer>}
    </div>
  );
};

export default Layout;
