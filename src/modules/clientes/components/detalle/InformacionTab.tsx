import type { Cliente } from "../../types";

interface Props {
  cliente: Cliente;
}

export default function InformacionTab({ cliente }: Props) {
  const Item = ({
    titulo,
    valor,
  }: {
    titulo: string;
    valor?: string;
  }) => (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {titulo}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {valor || "-"}
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Item titulo="Empresa" valor={cliente.empresa} />
      <Item titulo="Email" valor={cliente.email} />
      <Item titulo="Teléfono" valor={cliente.telefono} />
      <Item titulo="Estado" valor={cliente.estado} />
      <Item titulo="Interés" valor={cliente.interes} />
      <Item titulo="Origen" valor={cliente.origen} />

      <div className="md:col-span-2 rounded-lg border border-slate-200 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Observaciones
        </p>

        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
          {cliente.observaciones || "Sin observaciones."}
        </p>
      </div>
    </div>
  );
}