export interface Cliente {
  id?: string;

  // =========================
  // DATOS PRINCIPALES
  // =========================

  nombre: string;
  empresa: string;
  email: string;
  telefono: string;

  // =========================
  // INFORMACIÓN COMERCIAL
  // =========================

  estado?: string;
  interes?: string;
  origen?: string;
  observaciones?: string;

  // =========================
  // UBICACIÓN Y WEB
  // =========================

  ciudad?: string;
  provincia?: string;
  pais?: string;
  web?: string;

  // =========================
  // CRM
  // =========================

  tipo_registro?: string;
  pipeline?: string;

  responsable?: string;
  valor_estimado?: number;

  proximo_contacto?: string;
  ultima_actividad?: string;

  // =========================
  // INTELIGENCIA COMERCIAL
  // =========================

  score?: number;
  clasificacion?: string;
  recomendacion?: string;
  ultimo_analisis_ia?: string;

  // =========================
  // SISTEMA
  // =========================

  created_at?: string;
}