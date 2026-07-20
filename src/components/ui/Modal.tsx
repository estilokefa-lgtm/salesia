import type { ReactNode } from "react";


type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};


export default function Modal({
  open,
  title,
  children,
  onClose,
}: ModalProps) {


  if (!open) return null;


  return (

    <div
    className="
      fixed
      inset-0
      z-50
      bg-black/40
      flex
      items-center
      justify-center
      p-4
    "
  >
    <div
      className="
        bg-white
        rounded-xl
        w-full
        max-w-5xl
        max-h-[90vh]
        overflow-y-auto
        p-6
      "
    >
      <div
        className="
          flex
          justify-between
          mb-4
        "
      >
        <h2 className="text-xl font-bold">
          {title}
        </h2>


          <button
            onClick={onClose}
          >
            ✕
          </button>


        </div>


        {children}


      </div>


    </div>

  );

}