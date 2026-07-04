import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
};

export default function Button({
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        rounded-lg
        bg-black
        px-5
        py-2
        text-sm
        font-medium
        text-white
        hover:bg-gray-800
        transition
      "
    >
      {children}
    </button>
  );
}