import type { Cliente } from "../../clientes/types";
import { apiFetch } from "../../../config/apiFetch";

export async function buscarEmpresas(params: {
  rubro: string;
  ciudad: string;
  cantidad: number;
}): Promise<Cliente[]> {
  const response = await apiFetch("/buscar-empresas", {
    method: "POST",
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(
      data.error || "Error buscando empresas"
    );
  }

  return data.resultados;
}

export async function enriquecerContacto(web: string) {
  const response = await apiFetch("/enriquecer-contacto", {
    method: "POST",
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
