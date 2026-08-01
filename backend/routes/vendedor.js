import express from "express";

import {
  ejecutarVendedor,
} from "../agents/vendedor/vendedorAgent.js";

import {
  obtenerMemoriaCliente,
  guardarMemoriaCliente,
} from "../services/memoriaIAService.js";

import {
  obtenerTareaIA,
  actualizarTareaIA,
} from "../services/tareasService.js";

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| UTILIDADES
|--------------------------------------------------------------------------
*/

function normalizarCanal(
  canal = ""
) {
  const valor = String(
    canal || ""
  )
    .trim()
    .toLowerCase();

  if (
    valor.includes(
      "whatsapp"
    )
  ) {
    return "WhatsApp";
  }

  if (
    valor.includes("email") ||
    valor.includes("correo")
  ) {
    return "Email";
  }

  if (
    valor.includes(
      "llamada"
    ) ||
    valor.includes(
      "telefono"
    ) ||
    valor.includes(
      "teléfono"
    )
  ) {
    return "Llamada";
  }

  return "WhatsApp";
}

function obtenerTipoTarea(
  canal
) {
  switch (
    normalizarCanal(canal)
  ) {
    case "Email":
      return "email";

    case "Llamada":
      return "llamada";

    default:
      return "whatsapp";
  }
}

function obtenerAccionTarea(
  canal
) {
  switch (
    normalizarCanal(canal)
  ) {
    case "Email":
      return "Enviar email";

    case "Llamada":
      return "Llamar";

    default:
      return "Abrir WhatsApp";
  }
}

function obtenerTituloTarea({
  canal,
  cliente,
}) {
  const nombre =
    cliente?.empresa ||
    cliente?.nombre ||
    "Cliente";

  switch (
    normalizarCanal(canal)
  ) {
    case "Email":
      return `Enviar email a ${nombre}`;

    case "Llamada":
      return `Llamar a ${nombre}`;

    default:
      return `Enviar WhatsApp a ${nombre}`;
  }
}

function construirClienteDesdeTarea(
  tarea
) {
  const payload =
    tarea?.payload || {};

  const clientePayload =
    payload.cliente || {};

  return {
    id:
      tarea.cliente_id ||
      clientePayload.id,

    nombre:
      clientePayload.nombre ||
      payload.cliente ||
      "Sin contacto identificado",

    empresa:
      clientePayload.empresa ||
      (
        typeof payload.cliente ===
        "string"
          ? payload.cliente
          : ""
      ),

    telefono:
      payload.telefono ||
      "",

    email:
      payload.email ||
      "",

    ciudad:
      payload.ciudad ||
      "",

    interes:
      payload.interes ||
      "",

    pipeline:
      payload.pipeline ||
      "",

    estado:
      payload.estado ||
      "",

    score:
      payload.score ??
      null,

    observaciones:
      payload.motivo ||
      tarea.descripcion ||
      "",

    recomendacion:
      payload.accion_recomendada ||
      "",

    ultimo_analisis_ia:
      payload.motivo ||
      "",
  };
}

function obtenerObjetivoDesdeTarea(
  tarea
) {
  const payload =
    tarea?.payload || {};

  return (
    payload.objetivo_vendedor ||
    payload.accion_recomendada ||
    tarea.descripcion ||
    "Realizar el contacto comercial recomendado y conseguir una respuesta concreta del cliente."
  );
}

/*
|--------------------------------------------------------------------------
| GENERAR MENSAJE DIRECTAMENTE
|--------------------------------------------------------------------------
|
| Esta ruta continúa disponible para usar el vendedor
| desde la ficha de un cliente.
|
*/

router.post(
  "/vendedor/generar-mensaje",
  async (req, res) => {
    try {
      const {
        cliente,
        objetivo,
        canal,
        usuario,
      } = req.body;

      if (!cliente) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "Los datos del cliente son obligatorios",
          });
      }

      if (!cliente.id) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "El cliente debe tener un id para utilizar la memoria IA",
          });
      }

      if (
        !objetivo?.trim()
      ) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "El objetivo comercial es obligatorio",
          });
      }

      const historial =
        await obtenerMemoriaCliente(
          cliente.id
        );

      const respuesta =
        await ejecutarVendedor({
          cliente,

          objetivo,

          canal,

          historial,
        });

      const decision =
        respuesta.resultado;

      const respuestaMemoria =
        decision.mensaje ||
        decision.guion_llamada ||
        decision.proxima_accion ||
        "Acción comercial analizada por SalesIA.";

      const conversacionGuardada =
        await guardarMemoriaCliente({
          clienteId:
            cliente.id,

          pregunta:
            objetivo.trim(),

          respuesta:
            respuestaMemoria,

          canal:
            decision.canal,

          asunto:
            decision.asunto,

          estrategia:
            decision.estrategia,

          proximaAccion:
            decision.proxima_accion,

          usuario:
            usuario ||
            "SalesIA Copilot",
        });

      return res.json({
        ok: true,

        ...respuesta,

        memoria: {
          guardada: true,

          conversacion:
            conversacionGuardada,
        },
      });
    } catch (error) {
      console.error(
        "Error Agente Vendedor:",
        error
      );

      return res
        .status(500)
        .json({
          ok: false,

          error:
            error instanceof Error
              ? error.message
              : "Error ejecutando el Agente Vendedor",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| EJECUTAR UNA TAREA COMERCIAL
|--------------------------------------------------------------------------
|
| Esta ruta:
|
| 1. Recupera una tarea de la Bandeja IA.
| 2. Construye el cliente.
| 3. Lee el objetivo definido por el Agente Comercial.
| 4. Consulta la memoria comercial.
| 5. Ejecuta al Agente Vendedor.
| 6. Actualiza la misma tarea.
| 7. Guarda la nueva memoria.
|
| No crea una segunda tarea.
|
*/

router.post(
  "/vendedor/ejecutar-tarea/:tareaId",
  async (req, res) => {
    try {
      const {
        tareaId,
      } = req.params;

      const tarea =
        await obtenerTareaIA(
          tareaId
        );

      if (!tarea) {
        return res
          .status(404)
          .json({
            ok: false,

            error:
              "No se encontró la tarea comercial",
          });
      }

      if (
        tarea.estado ===
        "Realizada"
      ) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "La tarea ya fue realizada",
          });
      }

      if (
        tarea.estado ===
        "Cancelada"
      ) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "La tarea está cancelada",
          });
      }

      const cliente =
        construirClienteDesdeTarea(
          tarea
        );

      if (!cliente.id) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "La tarea no tiene un cliente válido",
          });
      }

      const objetivo =
        obtenerObjetivoDesdeTarea(
          tarea
        );

      const canalInicial =
        normalizarCanal(
          tarea.payload
            ?.canal_recomendado ||
          tarea.payload
            ?.canal_final ||
          tarea.tipo ||
          "WhatsApp"
        );

      /*
       * Antes de invocar a la IA,
       * dejamos la tarea en proceso.
       */

      await actualizarTareaIA(
        tarea.id,
        {
          estado:
            "En proceso",

          responsable:
            "Vendedor IA",
        }
      );

      const historial =
        await obtenerMemoriaCliente(
          cliente.id
        );

      const respuestaVendedor =
        await ejecutarVendedor({
          cliente,

          objetivo,

          canal:
            canalInicial,

          historial,
        });

      const decision =
        respuestaVendedor.resultado;

      const canalFinal =
        normalizarCanal(
          decision.canal ||
          canalInicial
        );

      const tipo =
        obtenerTipoTarea(
          canalFinal
        );

      const payloadAnterior =
        tarea.payload || {};

      /*
       * Conservamos los datos generados
       * por el Comercial y agregamos
       * la ejecución definitiva del Vendedor.
       */

      const nuevoPayload = {
        ...payloadAnterior,

        cliente: {
          id:
            cliente.id,

          nombre:
            cliente.nombre ||
            "",

          empresa:
            cliente.empresa ||
            "",
        },

        telefono:
          cliente.telefono ||
          "",

        email:
          cliente.email ||
          "",

        objetivo_vendedor:
          objetivo,

        canal_inicial:
          canalInicial,

        canal_final:
          canalFinal,

        tipo_final:
          tipo,

        accion_vendedor:
          decision.accion ||
          "",

        prioridad_vendedor:
          decision.prioridad ||
          "media",

        estrategia_vendedor:
          decision.estrategia ||
          "",

        proxima_accion:
          decision.proxima_accion ||
          "",

        dias_hasta_seguimiento:
          decision.dias_hasta_seguimiento ??
          3,

        crear_tarea:
          decision.crear_tarea !==
          false,

        mensaje_whatsapp:
          canalFinal ===
          "WhatsApp"
            ? decision.mensaje ||
              payloadAnterior
                .mensaje_whatsapp ||
              ""
            : payloadAnterior
                .mensaje_whatsapp ||
              "",

        asunto_email:
          canalFinal ===
          "Email"
            ? decision.asunto ||
              payloadAnterior
                .asunto_email ||
              ""
            : payloadAnterior
                .asunto_email ||
              "",

        cuerpo_email:
          canalFinal ===
          "Email"
            ? decision.mensaje ||
              payloadAnterior
                .cuerpo_email ||
              ""
            : payloadAnterior
                .cuerpo_email ||
              "",

        guion_llamada:
          canalFinal ===
          "Llamada"
            ? decision.guion_llamada ||
              payloadAnterior
                .guion_llamada ||
              ""
            : payloadAnterior
                .guion_llamada ||
              "",

        vendedor_ejecutado:
          true,

        vendedor_ejecutado_at:
          new Date().toISOString(),

        proveedor_ia:
          respuestaVendedor.proveedor,

        modelo_ia:
          respuestaVendedor.modelo,
      };

      const correspondeContactar =
        decision.crear_tarea !==
          false &&
        decision.canal !==
          "Ninguno" &&
        decision.accion !==
          "ninguna";

      /*
       * Si el Vendedor considera que
       * no corresponde contactar,
       * mantenemos la tarea actualizada
       * para revisión manual.
       */

      const estadoFinal =
        correspondeContactar
          ? "En proceso"
          : "Pendiente";

      const tareaActualizada =
        await actualizarTareaIA(
          tarea.id,
          {
            agente:
              "Vendedor",

            tipo,

            titulo:
              correspondeContactar
                ? obtenerTituloTarea({
                    canal:
                      canalFinal,

                    cliente,
                  })
                : `Revisar contacto con ${
                    cliente.empresa ||
                    cliente.nombre ||
                    "cliente"
                  }`,

            descripcion:
              decision.estrategia ||
              decision.proxima_accion ||
              tarea.descripcion,

            prioridad:
              decision.prioridad ===
                "alta" ||
              decision.prioridad ===
                "Alta"
                ? "Alta"
                : decision.prioridad ===
                      "baja" ||
                    decision.prioridad ===
                      "Baja"
                  ? "Baja"
                  : "Media",

            estado:
              estadoFinal,

            accion:
              correspondeContactar
                ? obtenerAccionTarea(
                    canalFinal
                  )
                : "Abrir cliente",

            ruta:
              `/clientes?cliente=${cliente.id}`,

            responsable:
              "Vendedor IA",

            payload:
              nuevoPayload,
          }
        );

      const respuestaMemoria =
        decision.mensaje ||
        decision.guion_llamada ||
        decision.proxima_accion ||
        "El Agente Vendedor analizó la tarea comercial.";

      const memoriaGuardada =
        await guardarMemoriaCliente({
          clienteId:
            cliente.id,

          pregunta:
            objetivo,

          respuesta:
            respuestaMemoria,

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

      return res.json({
        ok: true,

        mensaje:
          correspondeContactar
            ? "El Agente Vendedor preparó el contacto comercial."
            : "El Agente Vendedor recomienda revisar el contacto antes de continuar.",

        tarea:
          tareaActualizada,

        cliente,

        objetivo,

        decision,

        agente:
          respuestaVendedor,

        memoria: {
          guardada:
            true,

          conversacion:
            memoriaGuardada,
        },
      });
    } catch (error) {
      console.error(
        "Error ejecutando tarea del Agente Vendedor:",
        error
      );

      /*
       * No intentamos actualizar nuevamente
       * la tarea dentro del catch para evitar
       * ocultar el error original.
       */

      return res
        .status(500)
        .json({
          ok: false,

          error:
            error instanceof Error
              ? error.message
              : "No se pudo ejecutar la tarea del Agente Vendedor",
        });
    }
  }
);

export default router;