import React from "react";

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
  return (
    <button
      className="bg-black text-golden font-bold py-2 px-4 rounded hover:bg-opacity-80 transition"
      {...props}
    >
      {children}
    </button>
  );
};
