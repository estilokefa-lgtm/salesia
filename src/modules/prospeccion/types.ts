import type { Cliente } from "../clientes/types";

export interface ResultadoProspeccion extends Cliente {
  // =========================
  // CONTROL DE INTERFAZ
  // =========================

  seleccionado?: boolean;

  // =========================
  // ANÁLISIS IA
  // =========================

  ultimo_analisis_ia?: string;

  // =========================
  // ENRIQUECIMIENTO
  // =========================

  enriquecido?: boolean;

  // Contacto principal encontrado
  whatsapp?: string;

  // Todos los contactos encontrados
  emails?: string[];
  telefonos?: string[];
  whatsapp_encontrados?: string[];

  // =========================
  // REDES SOCIALES
  // =========================

  redes?: {
    instagram?: string[];
    facebook?: string[];
    linkedin?: string[];
  };
}