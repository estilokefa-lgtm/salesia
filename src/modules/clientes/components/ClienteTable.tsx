import type { Cliente } from "../types";

type Props = {
  clientes: Cliente[];
  onView: (cliente: Cliente) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
};

export default function ClienteTable({
  clientes,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="mt-8 rounded-xl border bg-white overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4">Nombre</th>
            <th className="p-4">Empresa</th>
            <th className="p-4">Email</th>
            <th className="p-4">Teléfono</th>
            <th className="p-4">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {clientes.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-6 text-center text-gray-500">
                No hay clientes registrados
              </td>
            </tr>
          ) : (
            clientes.map((cliente) => (
              <tr key={cliente.id} className="border-t">
                <td className="p-4">{cliente.nombre}</td>
                <td className="p-4">{cliente.empresa}</td>
                <td className="p-4">{cliente.email}</td>
                <td className="p-4">{cliente.telefono}</td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(cliente)}
                      className="rounded bg-gray-700 px-3 py-1 text-sm text-white"
                    >
                      Ver
                    </button>

                    <button
                      onClick={() => onEdit(cliente)}
                      className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => cliente.id && onDelete(cliente.id)}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}