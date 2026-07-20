import express from "express";

import {
  obtenerCarteraComercial,
  obtenerUltimasMemoriasClientes,
} from "../services/comercialService.js";

import {
  ejecutarAgenteComercial,
} from "../agents/comercial/comercialAgent.js";

const router = express.Router();

router.post(
  "/comercial/analizar-cartera",
  async (_req, res) => {
    try {
      const clientes =
        await obtenerCarteraComercial();

      const clienteIds = clientes
        .map((cliente) => cliente.id)
        .filter(
          (id) =>
            id !== undefined &&
            id !== null
        );

      const memorias =
        await obtenerUltimasMemoriasClientes(
          clienteIds
        );

      const resultado =
        await ejecutarAgenteComercial({
          clientes,
          memorias,
        });

      res.json({
        ok: true,
        ...resultado,
      });
    } catch (error) {
      console.error(
        "Error Agente Comercial:",
        error
      );

      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error ejecutando el Agente Comercial",
      });
    }
  }
);

export default router;