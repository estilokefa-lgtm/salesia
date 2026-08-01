import express from "express";

import {
  ejecutarFlujoVendedor,
} from "../agents/vendedor/vendedorWorkflow.js";

const router = express.Router();

router.post(
  "/ejecutar",
  async (req, res) => {
    try {
      const {
        cliente,
        objetivo,
        canal,
      } = req.body ?? {};

      if (!cliente?.id) {
        return res.status(400).json({
          ok: false,
          error:
            "El cliente y su id son obligatorios",
        });
      }

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
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo ejecutar el Agente Vendedor",
      });
    }
  }
);

export default router;