import type {
    TextareaHTMLAttributes,
  } from "react";
  
  type Props =
    TextareaHTMLAttributes<HTMLTextAreaElement> & {
      label: string;
    };
  
  export default function Textarea({
    label,
    ...props
  }: Props) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">
          {label}
        </label>
  
        <textarea
          {...props}
          className="rounded-lg border px-3 py-2"
        />
      </div>
    );
  }