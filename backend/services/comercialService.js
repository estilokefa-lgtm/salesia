import { supabase } from "./supabaseService.js";

export async function obtenerCarteraComercial() {
  const { data, error } = await supabase
    .from("clientes")
    .select(`
  id,
  nombre,
  empresa,
  telefono,
  email,
  ciudad,
  provincia,
  pais,
  estado,
  interes,
  origen,
  pipeline,
  proximo_contacto,
  valor_estimado,
  score,
  responsable,
  web,
  ultimo_analisis_ia,
  observaciones,
  tipo_registro,
  created_at
`)
    .order("score", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error(
      "Error obteniendo cartera comercial:",
      error
    );

    throw new Error(
      `No se pudo obtener la cartera comercial: ${error.message}`
    );
  }

  return data || [];
}

export async function obtenerUltimasMemoriasClientes(
  clienteIds
) {
  if (
    !Array.isArray(clienteIds) ||
    clienteIds.length === 0
  ) {
    return [];
  }

  const { data, error } = await supabase
    .from("ia_conversaciones")
    .select(`
      id,
      cliente_id,
      pregunta,
      respuesta,
      canal,
      estrategia,
      proxima_accion,
      created_at
    `)
    .in("cliente_id", clienteIds)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error obteniendo memorias comerciales:",
      error
    );

    throw new Error(
      `No se pudieron obtener las memorias comerciales: ${error.message}`
    );
  }

  const ultimaPorCliente = new Map();

  for (const memoria of data || []) {
    if (!ultimaPorCliente.has(memoria.cliente_id)) {
      ultimaPorCliente.set(
        memoria.cliente_id,
        memoria
      );
    }
  }

  return Array.from(
    ultimaPorCliente.values()
  );
}