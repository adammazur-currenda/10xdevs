import React, { useRef, useEffect } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({ error, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [props.value]);

  const baseClasses = "w-full border rounded-md p-2 focus:outline-none transition duration-100";
  const errorClasses = error ? " border-red-500" : " border-gray-300 focus:border-blue-500";
  const disabledClasses = props.disabled ? " bg-gray-100 cursor-not-allowed" : "";
  const finalClasses = `${baseClasses}${errorClasses}${disabledClasses} ${props.className || ""}`;

  return (
    <textarea
      {...props}
      ref={textareaRef}
      className={finalClasses}
      onInput={(e) => {
        adjustHeight();
        if (props.onInput) {
          props.onInput(e);
        }
      }}
    />
  );
};

export default Textarea;
