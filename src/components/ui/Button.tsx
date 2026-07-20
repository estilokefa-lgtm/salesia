import type {
  ReactNode,
  ButtonHTMLAttributes,
} from "react";

type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
  };

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        rounded-lg
        bg-black
        px-5
        py-2
        text-sm
        font-medium
        text-white
        transition
        hover:bg-gray-800
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}