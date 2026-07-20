import type { Cliente } from "../../clientes/types";

export async function buscarEmpresas(params: {
  rubro: string;
  ciudad: string;
  cantidad: number;
}): Promise<Cliente[]> {
  const response = await fetch("http://localhost:3001/api/buscar-empresas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Error buscando empresas");
  }

  return data.resultados;
}