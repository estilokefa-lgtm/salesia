import { Link } from "react-router-dom";

const items = [
  "Dashboard",
  "Clientes",
  "Conversaciones",
  "Agentes IA",
  "Productos",
  "Ventas",
  "Configuración",
];

export default function Sidebar() {
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
          text-xl
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
            key={item}
            to="/"
            className="
              rounded-lg
              px-4
              py-3
              text-sm
              text-slate-200
              transition
              hover:bg-slate-800
              hover:text-white
            "
          >
            {item}

          </Link>

        ))}


      </nav>


    </aside>
  );
}