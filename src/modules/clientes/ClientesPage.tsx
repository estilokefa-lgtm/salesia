import ClienteTable from "./components/ClienteTable";

export default function ClientesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">
        Clientes
      </h1>

      <p className="mt-2 text-gray-500">
        Gestión de clientes
      </p>

      <button
        className="mt-6 rounded-lg bg-black px-5 py-2 text-white"
      >
        Nuevo cliente
      </button>

      <ClienteTable />
    </div>
  );
}