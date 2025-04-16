import React from "react";

interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ header, footer, children, className = "" }) => {
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      {header && <div className="mb-4 border-b pb-2">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-4 border-t pt-2">{footer}</div>}
    </div>
  );
};

export default Card;
