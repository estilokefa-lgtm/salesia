import { supabase } from "../../../lib/supabase";

export interface IAConversacion {
  id?: number;
  cliente_id: number;
  pregunta: string;
  respuesta: string;
  canal?: string;
  asunto?: string;
  estrategia?: string;
  proxima_accion?: string;
  usuario?: string;
  created_at?: string;
}

// Obtener historial de un cliente
export async function obtenerConversacionesCliente(
  clienteId: number
) {
  const { data, error } = await supabase
    .from("ia_conversaciones")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data || [];
}

// Guardar conversación
export async function guardarConversacionIA(
  conversacion: IAConversacion
) {
  const { data, error } = await supabase
    .from("ia_conversaciones")
    .insert(conversacion)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Eliminar conversación
export async function eliminarConversacion(
  id: number
) {
  const { error } = await supabase
    .from("ia_conversaciones")
    .delete()
    .eq("id", id);

  if (error) throw error;
}