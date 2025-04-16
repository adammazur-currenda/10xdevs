import React, { useState } from "react";

interface FeedbackProps {
  variant?: "success" | "error" | "warning" | "info";
  dismissible?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Feedback: React.FC<FeedbackProps> = ({
  variant = "info",
  dismissible = false,
  onClose,
  children,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const variantStyles = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  if (!isVisible) return null;

  return (
    <div className={`border-l-4 p-4 ${variantStyles[variant]} ${className}`} role="alert">
      <div className="flex justify-between items-center">
        <div>{children}</div>
        {dismissible && (
          <button
            aria-label="Close"
            onClick={() => {
              setIsVisible(false);
              if (onClose) onClose();
            }}
            className="text-xl font-bold ml-4"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Feedback;
