import { Link, useLocation } from "react-router-dom";

const items = [
  {
    label: "🏠 Dashboard",
    to: "/",
  },
  {
    label: "👥 Clientes",
    to: "/clientes",
  },
  {
    label: "🤖 Prospector IA",
    to: "/prospeccion",
  },
  {
    label: "💬 Conversaciones",
    to: "/conversaciones",
  },
  {
    label: "🧠 Agentes IA",
    to: "/agentes",
  },
  {
    label: "📦 Productos",
    to: "/productos",
  },
  {
    label: "💰 Ventas",
    to: "/ventas",
  },
  {
    label: "📥 Bandeja IA",
    to: "/bandeja",
  },
  {
    label: "⚙️ Configuración",
    to: "/configuracion",
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="
        w-64
        min-h-screen
        bg-slate-900
        text-white
        p-6
      "
    >
      <div
        className="
          mb-10
          text-2xl
          font-bold
        "
      >
        🚀 SalesIA
      </div>

      <nav
        className="
          flex
          flex-col
          gap-2
        "
      >
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`rounded-lg px-4 py-3 text-sm transition ${
              location.pathname === item.to
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}