// client/src/components/ui/Button.jsx
import React from "react";

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors duration-200";

  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-white/10 hover:bg-white/20 text-gray-100",
    ghost: "bg-transparent hover:bg-white/10 text-gray-300",
  };

  return (
    <button className={`${base} ${styles[variant] || ""} ${className}`} {...props}>
      {children}
    </button>
  );
}
