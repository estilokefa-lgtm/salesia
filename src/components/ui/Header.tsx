import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Header() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function cargarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);
      }
    }

    cargarUsuario();
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header
      className="
        h-16
        bg-white
        border-b
        flex
        items-center
        justify-between
        px-6
      "
    >
      <h3
        className="
          text-lg
          font-semibold
          text-gray-900
        "
      >
        Dashboard
      </h3>

      <div
        className="
          flex
          items-center
          gap-5
        "
      >
        <input
          placeholder="Buscar..."
          className="
            w-64
            px-4
            py-2
            rounded-lg
            border
            text-sm
            outline-none
            focus:ring-2
          "
        />

        <div className="text-right">
  {email && (
    <div className="text-sm font-medium text-gray-700">
      {email}
    </div>
  )}
</div>

        <button
          onClick={cerrarSesion}
          className="
            px-4
            py-2
            rounded-lg
            border
            border-gray-300
            text-sm
            font-medium
            text-gray-700
            hover:bg-gray-100
            transition
          "
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
