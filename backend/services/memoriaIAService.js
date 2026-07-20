import { supabase } from "./supabaseService.js";

const LIMITE_HISTORIAL = 12;

export async function obtenerMemoriaCliente(clienteId) {
  if (clienteId === undefined || clienteId === null || clienteId === "") {
    return [];
  }

  console.log("Buscando memoria del cliente:", clienteId);

  const { data, error } = await supabase
    .from("ia_conversaciones")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("created_at", {
      ascending: false,
    })
    .limit(LIMITE_HISTORIAL);

  if (error) {
    console.error("Error obteniendo memoria IA:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      `No se pudo recuperar la memoria del cliente: ${error.message}`
    );
  }

  return (data || []).reverse();
}

export async function guardarMemoriaCliente({
  clienteId,
  pregunta,
  respuesta,
  canal,
  asunto = "",
  estrategia = "",
  proximaAccion = "",
  usuario = "SalesIA Copilot",
}) {
  if (clienteId === undefined || clienteId === null || clienteId === "") {
    throw new Error(
      "El cliente_id es obligatorio para guardar la memoria"
    );
  }

  const nuevaConversacion = {
    cliente_id: clienteId,
    pregunta,
    respuesta,
    canal,
    asunto,
    estrategia,
    proxima_accion: proximaAccion,
    usuario,
  };

  const { data, error } = await supabase
    .from("ia_conversaciones")
    .insert([nuevaConversacion])
    .select("*")
    .single();

  if (error) {
    console.error("Error guardando memoria IA:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      `No se pudo guardar la conversación IA: ${error.message}`
    );
  }

  return data;
}