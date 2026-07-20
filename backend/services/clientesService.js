import { supabase } from "./supabaseService.js";

export async function obtenerClientesParaAnalisis({
  limite = 100,
} = {}) {
  const limiteSeguro = Math.min(
    500,
    Math.max(1, Number(limite) || 100)
  );

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(limiteSeguro);

  if (error) {
    console.error(
      "Error obteniendo clientes para análisis:",
      error
    );

    throw new Error(
      "No se pudieron recuperar los clientes"
    );
  }

  return data ?? [];
}