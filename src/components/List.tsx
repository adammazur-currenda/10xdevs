import React from "react";

interface ListProps {
  items: React.ReactNode[];
  ordered?: boolean;
  className?: string;
}

export const List: React.FC<ListProps> = ({ items, ordered = false, className = "" }) => {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag className={`list-disc pl-5 space-y-2 ${className}`}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ListTag>
  );
};

export default List;
