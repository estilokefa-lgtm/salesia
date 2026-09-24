import { supabase } from "../../../lib/supabase";

export async function crearActividadCliente({
  clienteId,
  tipo,
  contenido,
  resultado,
}: {
  clienteId: string;
  tipo: string;
  contenido?: string;
  resultado?: string;
}) {
  const { data, error } = await supabase
    .from("actividades_cliente")
    .insert({
      cliente_id: clienteId,
      tipo,
      contenido: contenido || null,
      resultado: resultado || null,
    })
    .select()
    .single();

  if (error) {
    console.error("ERROR CREANDO ACTIVIDAD:", error);
    throw error;
  }

  return data;
}