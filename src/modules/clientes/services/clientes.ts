import { supabase } from "../../../lib/supabase";
import type { Cliente } from "../types";

// =========================
// OBTENER CLIENTES
// =========================

export async function getClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ERROR OBTENIENDO CLIENTES:", error);
    throw error;
  }

  return data;
}

// =========================
// CREAR CLIENTE
// =========================

export async function createCliente(cliente: Cliente) {
  const clienteLimpio = {
    nombre: cliente.nombre || "",
    empresa: cliente.empresa || "",
    email: cliente.email || "",
    telefono: cliente.telefono || "",

    estado: cliente.estado || "Nuevo",
    interes: cliente.interes || "",
    origen: cliente.origen || "",
    observaciones: cliente.observaciones || "",

    ciudad: cliente.ciudad || "",
    pipeline: cliente.pipeline || "Nuevo",

    score: cliente.score ?? null,
    clasificacion: cliente.clasificacion || "",
    recomendacion: cliente.recomendacion || "",
  };

  console.log(
    "CLIENTE FINAL ENVIADO A SUPABASE:",
    clienteLimpio
  );

  console.log(
    "CAMPOS ENVIADOS:",
    Object.keys(clienteLimpio)
  );

  const { data, error } = await supabase
    .from("clientes")
    .insert(clienteLimpio)
    .select()
    .single();

  if (error) {
    console.error(
      "ERROR CREANDO CLIENTE:",
      error
    );

    throw error;
  }

  return data;
}
// =========================
// ACTUALIZAR CLIENTE
// =========================

export async function updateCliente(
  id: string,
  cliente: Partial<Cliente>
) {
  const { data, error } = await supabase
    .from("clientes")
    .update(cliente)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(
      "ERROR ACTUALIZANDO CLIENTE:",
      error
    );

    throw error;
  }

  return data;
}

// =========================
// ELIMINAR CLIENTE
// =========================

export async function deleteCliente(id: string) {
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "ERROR ELIMINANDO CLIENTE:",
      error
    );

    throw error;
  }

  return true;
}

// =========================
// DETECTAR DUPLICADOS
// =========================

export async function existeClienteDuplicado(cliente: {
  empresa?: string;
  telefono?: string;
  email?: string;
}) {
  const filtros: string[] = [];

  if (cliente.telefono?.trim()) {
    filtros.push(
      `telefono.eq.${cliente.telefono.trim()}`
    );
  }

  if (cliente.email?.trim()) {
    filtros.push(
      `email.eq.${cliente.email.trim()}`
    );
  }

  if (cliente.empresa?.trim()) {
    filtros.push(
      `empresa.ilike.${cliente.empresa.trim()}`
    );
  }

  if (filtros.length === 0) {
    return false;
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("id")
    .or(filtros.join(","))
    .limit(1);

  if (error) {
    console.error(
      "ERROR VERIFICANDO DUPLICADO:",
      error
    );

    throw error;
  }

  return (data?.length ?? 0) > 0;
}