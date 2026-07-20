import type { Cliente } from "../../types";

interface Props {
  cliente: Cliente;
}

export default function SeguimientosTab({ cliente }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 p-8 text-center">
      <h3 className="text-lg font-semibold">Seguimientos</h3>

      <p className="mt-2 text-slate-500">
        Aquí se mostrarán las tareas y próximos contactos de {cliente.nombre}.
      </p>
    </div>
  );
}