import type { Cliente } from "../clientes/types";

export interface ResultadoProspeccion extends Cliente {
  clasificacion?: string;
  recomendacion?: string;
  seleccionado?: boolean;
  ultimo_analisis_ia?: string;
}