import React from "react";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "h1" | "h2" | "h3" | "body" | "caption";
}

export const Typography: React.FC<TypographyProps> = ({ variant = "body", children, ...props }) => {
  let Component: React.ElementType = "p";
  switch (variant) {
    case "h1":
      Component = "h1";
      break;
    case "h2":
      Component = "h2";
      break;
    case "h3":
      Component = "h3";
      break;
    case "caption":
      Component = "span";
      break;
    default:
      Component = "p";
  }

  const baseClasses = {
    h1: "text-4xl font-bold mb-4",
    h2: "text-3xl font-semibold mb-3",
    h3: "text-2xl font-medium mb-2",
    body: "text-base mb-2",
    caption: "text-xs text-gray-600",
  };

  return (
    <Component className={`${baseClasses[variant]} ${props.className || ""}`} {...props}>
      {children}
    </Component>
  );
};

export default Typography;
