import { supabase } from "../../../lib/supabase";
import type { Cliente } from "../types";

export async function getClientes() {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createCliente(cliente: Cliente) {
  const { data, error } = await supabase
    .from("clientes")
    .insert(cliente)
    .select()
    .single();

  if (error) throw error;

  return data;
}

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

  if (error) throw error;

  return data;
}

export async function deleteCliente(id: string) {
  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}

export async function existeClienteDuplicado(cliente: {
  empresa?: string;
  telefono?: string;
  email?: string;
}) {
  const filtros: string[] = [];

  if (cliente.telefono?.trim()) {
    filtros.push(`telefono.eq.${cliente.telefono.trim()}`);
  }

  if (cliente.email?.trim()) {
    filtros.push(`email.eq.${cliente.email.trim()}`);
  }

  if (cliente.empresa?.trim()) {
    filtros.push(`empresa.ilike.${cliente.empresa.trim()}`);
  }

  if (filtros.length === 0) {
    return false;
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("id")
    .or(filtros.join(","))
    .limit(1);

  if (error) throw error;

  return (data?.length ?? 0) > 0;
}