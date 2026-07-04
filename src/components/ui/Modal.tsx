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
        bg-black/40
        flex
        items-center
        justify-center
      "
    >


      <div
        className="
          bg-white
          rounded-xl
          p-6
          w-full
          max-w-lg
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