import express from "express";

import {
  ejecutarVendedor,
} from "../agents/vendedor/vendedorAgent.js";

import {
  obtenerMemoriaCliente,
  guardarMemoriaCliente,
} from "../services/memoriaIAService.js";

const router = express.Router();

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
        return res.status(400).json({
          ok: false,
          error:
            "Los datos del cliente son obligatorios",
        });
      }

      if (!cliente.id) {
        return res.status(400).json({
          ok: false,
          error:
            "El cliente debe tener un id para utilizar la memoria IA",
        });
      }

      if (!objetivo?.trim()) {
        return res.status(400).json({
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

      const conversacionGuardada =
        await guardarMemoriaCliente({
          clienteId: cliente.id,
          pregunta: objetivo.trim(),
          respuesta:
            respuesta.resultado.mensaje,
          canal:
            respuesta.resultado.canal,
          asunto:
            respuesta.resultado.asunto,
          estrategia:
            respuesta.resultado.estrategia,
          proximaAccion:
            respuesta.resultado
              .proxima_accion,
          usuario:
            usuario || "SalesIA Copilot",
        });

      res.json({
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

      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error ejecutando el Agente Vendedor",
      });
    }
  }
);

export default router;