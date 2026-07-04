import type { ChangeEvent } from "react";


type InputProps = {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};


export default function Input({
  label,
  placeholder,
  value,
  onChange,
}: InputProps) {


  return (

    <div className="flex flex-col gap-2">


      <label className="text-sm font-medium">
        {label}
      </label>


      <input

        value={value}

        onChange={onChange}

        placeholder={placeholder}

        className="
          rounded-lg
          border
          px-4
          py-2
        "

      />


    </div>

  );

}