import type { Cliente } from "../../types";

interface Props {
  cliente: Cliente;
}

export default function ConversacionesTab({ cliente }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 p-8 text-center">
      <h3 className="text-lg font-semibold">Conversaciones</h3>

      <p className="mt-2 text-slate-500">
        Aquí aparecerán los WhatsApp, emails y llamadas de {cliente.nombre}.
      </p>
    </div>
  );
}