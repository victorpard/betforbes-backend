import React from 'react';

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className="w-full p-2 bg-[#333] border border-gray-600 rounded text-white"
      {...props}
    />
  );
};
