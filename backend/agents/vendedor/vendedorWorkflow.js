import {
    ejecutarVendedor,
  } from "./vendedorAgent.js";
  
  import {
    obtenerMemoriaCliente,
    guardarMemoriaCliente,
  } from "../../services/memoriaIAService.js";
  
  import {
    crearTareaIA,
  } from "../../services/tareasService.js";
  
  function normalizarCanal(canal = "") {
    const canalNormalizado =
      canal
        .toString()
        .trim()
        .toLowerCase();
  
    if (canalNormalizado === "whatsapp") {
      return "whatsapp";
    }
  
    if (canalNormalizado === "email") {
      return "email";
    }
  
    if (canalNormalizado === "llamada") {
      return "llamada";
    }
  
    return "seguimiento";
  }
  
  function crearTitulo({
    canal,
    cliente,
  }) {
    const empresa =
      cliente.empresa ||
      cliente.nombre ||
      "Cliente";
  
    switch (canal) {
      case "whatsapp":
        return `Enviar WhatsApp a ${empresa}`;
  
      case "email":
        return `Enviar email a ${empresa}`;
  
      case "llamada":
        return `Llamar a ${empresa}`;
  
      default:
        return `Realizar seguimiento a ${empresa}`;
    }
  }
  
  function crearAccion(canal) {
    switch (canal) {
      case "whatsapp":
        return "Abrir WhatsApp";
  
      case "email":
        return "Enviar email";
  
      case "llamada":
        return "Llamar";
  
      default:
        return "Ver cliente";
    }
  }
  
  export async function ejecutarFlujoVendedor({
    cliente,
    objetivo,
    canal,
    historialInicial,
  }) {
    if (!cliente?.id) {
      throw new Error(
        "El cliente y su id son obligatorios"
      );
    }
  
    const objetivoFinal =
      objetivo?.trim() ||
      "Analizar al cliente y definir la mejor próxima acción comercial.";
  
    const historial =
      historialInicial ??
      await obtenerMemoriaCliente(
        cliente.id
      );
  
    const respuestaAgente =
      await ejecutarVendedor({
        cliente,
  
        objetivo:
          objetivoFinal,
  
        canal:
          canal || "WhatsApp",
  
        historial,
      });
  
    const decision =
      respuestaAgente.resultado;
  
    const noCrearTarea =
      decision.crear_tarea === false ||
      decision.canal === "Ninguno" ||
      decision.accion === "ninguna";
  
    if (noCrearTarea) {
      await guardarMemoriaCliente({
        clienteId:
          cliente.id,
  
        pregunta:
          objetivoFinal,
  
        respuesta:
          decision.mensaje ||
          "El agente decidió no crear una tarea comercial.",
  
        canal:
          decision.canal,
  
        asunto:
          decision.asunto,
  
        estrategia:
          decision.estrategia,
  
        proximaAccion:
          decision.proxima_accion,
  
        usuario:
          "Agente Vendedor",
      });
  
      return {
        ok: true,
  
        tarea_creada: false,
  
        tarea_existente: false,
  
        tarea: null,
  
        agente:
          respuestaAgente,
  
        decision,
  
        mensaje:
          "El agente decidió que no corresponde crear una tarea.",
      };
    }
  
    const tipo =
      normalizarCanal(
        decision.canal
      );
  
    const resultadoTarea =
      await crearTareaIA({
        cliente_id:
          cliente.id,
  
        agente:
          "Vendedor",
  
        tipo,
  
        titulo:
          crearTitulo({
            canal: tipo,
            cliente,
          }),
  
        descripcion:
          decision.estrategia ||
          decision.proxima_accion ||
          "Acción comercial generada por el Agente Vendedor.",
  
        prioridad:
          decision.prioridad === "alta" ||
          decision.prioridad === "Alta"
            ? "Alta"
            : decision.prioridad === "baja" ||
                decision.prioridad === "Baja"
              ? "Baja"
              : "Media",
  
        estado:
          "Pendiente",
  
        accion:
          crearAccion(tipo),
  
        ruta:
          `/clientes/${cliente.id}`,
  
        responsable:
          "Vendedor IA",
  
        payload: {
          cliente: {
            id:
              cliente.id,
  
            nombre:
              cliente.nombre || "",
  
            empresa:
              cliente.empresa || "",
          },
  
          telefono:
            cliente.telefono || "",
  
          email:
            cliente.email || "",
  
          score:
            cliente.score ?? null,
  
          accion:
            decision.accion,
  
          canal:
            decision.canal,
  
          estrategia:
            decision.estrategia,
  
          proxima_accion:
            decision.proxima_accion,
  
          dias_hasta_seguimiento:
            decision.dias_hasta_seguimiento,
  
          mensaje_whatsapp:
            tipo === "whatsapp"
              ? decision.mensaje
              : "",
  
          asunto_email:
            tipo === "email"
              ? decision.asunto
              : "",
  
          cuerpo_email:
            tipo === "email"
              ? decision.mensaje
              : "",
  
          guion_llamada:
            tipo === "llamada"
              ? decision.guion_llamada
              : "",
        },
      });
  
    await guardarMemoriaCliente({
      clienteId:
        cliente.id,
  
      pregunta:
        objetivoFinal,
  
      respuesta:
        decision.mensaje ||
        decision.guion_llamada ||
        decision.proxima_accion,
  
      canal:
        decision.canal,
  
      asunto:
        decision.asunto,
  
      estrategia:
        decision.estrategia,
  
      proximaAccion:
        decision.proxima_accion,
  
      usuario:
        "Agente Vendedor",
    });
  
    return {
      ok: true,
  
      tarea_creada:
        resultadoTarea.creada,
  
      tarea_existente:
        !resultadoTarea.creada,
  
      tarea:
        resultadoTarea.tarea,
  
      agente:
        respuestaAgente,
  
      decision,
    };
  }