import type { Cliente } from "../../clientes/types";
import { API_BASE } from "../../../config/api";

export async function buscarEmpresas(params: {
  rubro: string;
  ciudad: string;
  cantidad: number;
}): Promise<Cliente[]> {
  const response = await fetch(`${API_BASE}/buscar-empresas`, {
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

export async function enriquecerContacto(web: string) {
  const response = await fetch(`${API_BASE}/enriquecer-contacto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      web,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(
      data.error || "No se pudo enriquecer el contacto"
    );
  }

  return data.resultado;
}
