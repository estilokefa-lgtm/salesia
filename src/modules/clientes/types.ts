export interface Cliente {
  id?: string;

  nombre: string;
  empresa: string;
  email: string;
  telefono: string;

  estado?: string;
  interes?: string;
  origen?: string;
  observaciones?: string;

  ciudad?: string;
  provincia?: string;
  pais?: string;
  web?: string;

  tipo_registro?: string;
  pipeline?: string;

  score?: number;
  seleccionado?: boolean;
  responsable?: string;
  valor_estimado?: number;
  ultimo_analisis_ia?: string;
  proximo_contacto?: string;
  ultima_actividad?: string;

  created_at?: string;
}