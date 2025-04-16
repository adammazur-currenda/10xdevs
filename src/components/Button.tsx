import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const variantClasses = {
  primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring focus:ring-blue-300",
  secondary: "bg-gray-500 text-white hover:bg-gray-600 focus:ring focus:ring-gray-300",
  ghost: "bg-transparent text-blue-500 hover:bg-blue-100 focus:ring focus:ring-blue-300",
};

export const Button: React.FC<ButtonProps> = ({ variant = "primary", className = "", ...props }) => {
  return (
    <button className={`${variantClasses[variant]} px-4 py-2 rounded ${className}`} {...props}>
      {props.children}
    </button>
  );
};

export default Button;
