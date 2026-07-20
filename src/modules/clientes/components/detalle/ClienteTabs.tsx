interface Props {
    tab: string;
    onChange: (tab: string) => void;
  }
  
  const tabs = [
    "Información",
    "Conversaciones",
    "Seguimientos",
    "IA",
  ];
  
  export default function ClienteTabs({ tab, onChange }: Props) {
    return (
      <div className="mb-4 flex gap-2 border-b border-slate-200">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`px-3 py-2 text-sm transition ${
              tab === item
                ? "border-b-2 border-slate-900 font-semibold text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    );
  }