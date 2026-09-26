import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-bold mb-4">
            IA
          </div>

          <h1 className="text-3xl font-bold text-white">
            SalesIA
          </h1>

          <p className="text-slate-400 mt-2">
            CRM + Inteligencia Artificial
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          <h2 className="text-2xl font-semibold text-slate-900">
            Iniciar sesión
          </h2>

          <p className="text-sm text-slate-500 mt-2 mb-6">
            Ingresá tus datos para acceder a SalesIA.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="nombre@empresa.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar a SalesIA"}
            </button>

          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Acceso exclusivo para usuarios autorizados
          </p>

        </div>
      </div>
    </div>
  );
}
