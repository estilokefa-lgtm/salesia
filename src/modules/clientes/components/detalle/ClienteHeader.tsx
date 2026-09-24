import type { Cliente } from "../../types";

interface Props {
  cliente: Cliente;
  onNuevaNota?: () => void;
}

export default function ClienteHeader({
  cliente,
  onNuevaNota,
}: Props) {
  function abrirEmail() {
    if (!cliente.email) {
      alert("Este cliente no tiene email registrado.");
      return;
    }

    const asunto = encodeURIComponent(
      `Contacto comercial - ${cliente.empresa || cliente.nombre}`
    );

    const cuerpo = encodeURIComponent(
      `Hola ${cliente.nombre || ""},\n\n`
    );

    window.location.href =
      `mailto:${cliente.email}?subject=${asunto}&body=${cuerpo}`;
  }

  function llamarCliente() {
    if (!cliente.telefono) {
      alert("Este cliente no tiene teléfono registrado.");
      return;
    }

    const telefono = cliente.telefono.replace(/\s+/g, "");

    window.location.href = `tel:${telefono}`;
  }

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
        {cliente.nombre?.charAt(0).toUpperCase() || "C"}
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-bold text-slate-900">
          {cliente.nombre}
        </h2>

        <p className="text-sm text-slate-500">
          {cliente.empresa || "Sin empresa registrada"}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {cliente.estado && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {cliente.estado}
            </span>
          )}

          {cliente.interes && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              {cliente.interes}
            </span>
          )}

          {cliente.origen && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
              {cliente.origen}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={abrirEmail}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Email
          </button>

          <button
            type="button"
            onClick={llamarCliente}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Llamar
          </button>

          <button
            type="button"
            onClick={onNuevaNota}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Nueva nota
          </button>
        </div>
      </div>
    </div>
  );
}