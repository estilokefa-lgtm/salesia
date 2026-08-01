import { supabase } from "./supabaseService.js";

export async function buscarTareaPendiente(
  cliente_id,
  agente
) {
  if (!cliente_id || !agente) {
    return null;
  }

  const { data, error } = await supabase
    .from("ia_tareas")
    .select("*")
    .eq("cliente_id", cliente_id)
    .eq("agente", agente)
    .eq("estado", "Pendiente")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Error buscando tarea pendiente:",
      error
    );

    throw error;
  }

  return data;
}

export async function crearTareaIA(tarea) {
  const tareaGuardar = {
    cliente_id: tarea.cliente_id ?? null,
    agente: tarea.agente,
    tipo: tarea.tipo ?? "seguimiento",
    titulo: tarea.titulo,
    descripcion: tarea.descripcion ?? null,
    prioridad: tarea.prioridad ?? "Media",
    estado: tarea.estado ?? "Pendiente",
    accion: tarea.accion ?? null,
    ruta: tarea.ruta ?? null,
    responsable: tarea.responsable ?? null,
    payload: tarea.payload ?? {},
  };

  const existente =
    await buscarTareaPendiente(
      tareaGuardar.cliente_id,
      tareaGuardar.agente
    );

  if (existente) {
    console.log(
      "Ya existe una tarea pendiente para este cliente y agente:",
      existente.id
    );

    return {
      tarea: existente,
      creada: false,
    };
  }

  const { data, error } = await supabase
    .from("ia_tareas")
    .insert([tareaGuardar])
    .select()
    .single();

  if (error) {
    console.error(
      "Error creando tarea IA:",
      error
    );

    throw new Error(
      "No se pudo crear la tarea IA"
    );
  }

  return {
    tarea: data,
    creada: true,
  };
}

export async function listarTareasIA({
  estado = "Pendiente",
  limite = 100,
} = {}) {
  let consulta = supabase
    .from("ia_tareas")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(limite);

  if (estado) {
    consulta = consulta.eq(
      "estado",
      estado
    );
  }

  const { data, error } =
    await consulta;

  if (error) {
    console.error(
      "Error listando tareas IA:",
      error
    );

    throw new Error(
      "No se pudieron recuperar las tareas IA"
    );
  }

  return data ?? [];
}

export async function obtenerTareaIA(id) {
  const { data, error } = await supabase
    .from("ia_tareas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(
      "Error recuperando tarea IA:",
      error
    );

    throw new Error(
      "No se pudo recuperar la tarea IA"
    );
  }

  return data;
}

export async function completarTareaIA(id) {
  const { data, error } = await supabase
    .from("ia_tareas")
    .update({
      estado: "Realizada",
      ejecutada_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(
      "Error completando tarea IA:",
      error
    );

    throw new Error(
      "No se pudo completar la tarea IA"
    );
  }

  return data;
}

export async function actualizarEstadoTareaIA(
  id,
  estado
) {
  const estadosPermitidos = [
    "Pendiente",
    "En proceso",
    "Realizada",
    "Cancelada",
  ];

  if (
    !estadosPermitidos.includes(estado)
  ) {
    throw new Error(
      `Estado de tarea no válido: ${estado}`
    );
  }

  const cambios = {
    estado,
    ejecutada_at:
      estado === "Realizada"
        ? new Date().toISOString()
        : null,
  };

  const { data, error } = await supabase
    .from("ia_tareas")
    .update(cambios)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(
      "Error actualizando tarea IA:",
      error
    );

    throw new Error(
      "No se pudo actualizar la tarea IA"
    );
  }

  return data;
}

export async function eliminarTareaIA(id) {
  const { error } = await supabase
    .from("ia_tareas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Error eliminando tarea IA:",
      error
    );

    throw new Error(
      "No se pudo eliminar la tarea IA"
    );
  }

  return true;
}

export async function actualizarTareaIA(
  id,
  cambios = {}
) {
  if (!id) {
    throw new Error(
      "El id de la tarea es obligatorio"
    );
  }

  const cambiosPermitidos = {};

  if (cambios.agente !== undefined)
    cambiosPermitidos.agente =
      cambios.agente;

  if (cambios.tipo !== undefined)
    cambiosPermitidos.tipo =
      cambios.tipo;

  if (cambios.titulo !== undefined)
    cambiosPermitidos.titulo =
      cambios.titulo;

  if (cambios.descripcion !== undefined)
    cambiosPermitidos.descripcion =
      cambios.descripcion;

  if (cambios.prioridad !== undefined)
    cambiosPermitidos.prioridad =
      cambios.prioridad;

  if (cambios.estado !== undefined)
    cambiosPermitidos.estado =
      cambios.estado;

  if (cambios.accion !== undefined)
    cambiosPermitidos.accion =
      cambios.accion;

  if (cambios.ruta !== undefined)
    cambiosPermitidos.ruta =
      cambios.ruta;

  if (cambios.responsable !== undefined)
    cambiosPermitidos.responsable =
      cambios.responsable;

  if (cambios.payload !== undefined)
    cambiosPermitidos.payload =
      cambios.payload;

  if (
    Object.keys(cambiosPermitidos)
      .length === 0
  ) {
    throw new Error(
      "No se informaron cambios para actualizar la tarea"
    );
  }

  const { data, error } = await supabase
    .from("ia_tareas")
    .update(cambiosPermitidos)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(
      "Error actualizando tarea IA:",
      error
    );

    throw new Error(
      "No se pudo actualizar la tarea IA"
    );
  }

  return data;
}
export async function obtenerClientesConTareasActivas(
  clientesIds = []
) {
  if (
    !Array.isArray(clientesIds) ||
    clientesIds.length === 0
  ) {
    return new Set();
  }

  const { data, error } =
    await supabase
      .from("ia_tareas")
      .select("cliente_id")
      .in(
        "cliente_id",
        clientesIds
      )
      .in("estado", [
        "Pendiente",
        "En proceso",
      ])
      .not(
        "cliente_id",
        "is",
        null
      );

  if (error) {
    console.error(
      "Error buscando clientes con tareas activas:",
      error
    );

    throw new Error(
      "No se pudieron consultar las tareas activas"
    );
  }

  return new Set(
    (data ?? []).map(
      (tarea) =>
        Number(tarea.cliente_id)
    )
  );
}