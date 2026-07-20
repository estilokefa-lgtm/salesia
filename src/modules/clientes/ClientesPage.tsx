import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import ClienteTable from "./components/ClienteTable";
import ClienteForm from "./components/ClienteForm";
import ClienteDetalle from "./components/ClienteDetalle";
import { useSearchParams } from "react-router-dom";

import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "./services/clientes";

import type { Cliente } from "./types";

export default function ClientesPage() {
  const [open, setOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteDetalle, setClienteDetalle] = useState<Cliente | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    cargarClientes();
  }, []);
  useEffect(() => {
    const clienteId = searchParams.get("cliente");
  
    if (!clienteId || clientes.length === 0) {
      return;
    }
  
    const clienteEncontrado = clientes.find(
      (cliente) => String(cliente.id) === clienteId
    );
  
    if (clienteEncontrado) {
      setClienteDetalle(clienteEncontrado);
    }
  }, [clientes, searchParams]);

  async function cargarClientes() {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = `
      ${cliente.nombre}
      ${cliente.empresa}
      ${cliente.email}
      ${cliente.telefono}
      ${cliente.estado}
      ${cliente.interes}
      ${cliente.origen}
    `.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="mt-2 text-gray-500">Gestión de clientes</p>
        </div>

        <button
          onClick={() => {
            setClienteEditando(null);
            setOpen(true);
          }}
          className="rounded-lg bg-black px-5 py-2 text-white"
        >
          Nuevo cliente
        </button>
      </div>

      <div className="mt-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, empresa, email, teléfono, estado, interés u origen..."
          className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <ClienteTable
        clientes={clientesFiltrados}
        onView={(cliente) => {
          setClienteDetalle(cliente);
        }}
        onEdit={(cliente) => {
          setClienteEditando(cliente);
          setOpen(true);
        }}
        onDelete={async (id) => {
          try {
            await deleteCliente(id);
            setClientes((anteriores) =>
              anteriores.filter((cliente) => cliente.id !== id)
            );
          } catch (error) {
            console.error("Error eliminando cliente:", error);
          }
        }}
      />

      <Modal
        open={open}
        title={clienteEditando ? "Editar cliente" : "Nuevo cliente"}
        onClose={() => setOpen(false)}
      >
        <ClienteForm
          cliente={clienteEditando}
          onSave={async (cliente) => {
            try {
              if (clienteEditando?.id) {
                const actualizado = await updateCliente(
                  clienteEditando.id,
                  cliente
                );

                setClientes((anteriores) =>
                  anteriores.map((item) =>
                    item.id === clienteEditando.id ? actualizado : item
                  )
                );
              } else {
                const nuevo = await createCliente(cliente);

                setClientes((anteriores) => [
                  nuevo,
                  ...anteriores,
                ]);
              }

              setClienteEditando(null);
              setOpen(false);
            } catch (error) {
              console.error("Error guardando cliente:", error);
            }
          }}
        />
      </Modal>

      <Modal
  open={clienteDetalle !== null}
  title="Detalle del cliente"
  onClose={() => {
    setClienteDetalle(null);
    setSearchParams({});
  }}
>
  {clienteDetalle && (
    <ClienteDetalle
      cliente={clienteDetalle}
    />
  )}
</Modal>
    </div>
  );
} 