import express from "express";

import {
    ejecutarFlujoVendedor,
  } from "../agents/vendedor/vendedorWorkflow.js";

const router = express.Router();

function normalizarCanal(canal = "") {
  const canalNormalizado =
    canal
      .toString()
      .trim()
      .toLowerCase();

  if (
    canalNormalizado === "whatsapp"
  ) {
    return "whatsapp";
  }

  if (
    canalNormalizado === "email"
  ) {
    return "email";
  }

  if (
    canalNormalizado === "llamada"
  ) {
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

router.post(
  "/ejecutar",
  async (req, res) => {
    try {
        router.post(
            "/ejecutar",
            async (req, res) => {
              try {
          
                const {
                  cliente,
                  objetivo,
                  canal,
                } = req.body;
          
                const resultado =
                  await ejecutarFlujoVendedor({
                    cliente,
                    objetivo,
                    canal,
                  });
          
                return res.json(resultado);
          
              } catch (error) {
          
                console.error(
                  "Error ejecutando Agente Vendedor:",
                  error
                );
          
                return res.status(500).json({
                  error:
                    error.message ||
                    "No se pudo ejecutar el Agente Vendedor",
                });
          
              }
            }
          );
      

      const tipo =
        normalizarCanal(
          decision.canal
        );

      const tarea =
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
            decision.prioridad ===
            "alta"
              ? "Alta"
              : decision.prioridad ===
                  "baja"
                ? "Baja"
                : "Media",

          estado:
            "Pendiente",

          accion:
            crearAccion(tipo),

          ruta:
            `/clientes/${cliente.id}`,

          responsable:
            "Vendedor",

          payload: {
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

            score:
              cliente.score ||
              null,

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

      return res.json({
        ok: true,
        tarea_creada: true,
        tarea,
        agente:
          respuestaAgente,
      });
    } catch (error) {
      console.error(
        "Error ejecutando Agente Vendedor:",
        error
      );

      return res.status(500).json({
        error:
          error.message ||
          "No se pudo ejecutar el Agente Vendedor",
      });
    }
  }
);

export default router;