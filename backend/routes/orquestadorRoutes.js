import express from "express";

import {
  ejecutarOrquestador,
} from "../agents/orquestador/orquestadorAgent.js";

const router = express.Router();

router.post(
  "/ejecutar",
  async (req, res) => {
    try {
      const limite =
        Number(req.body?.limite) ||
        100;

      const resultado =
        await ejecutarOrquestador({
          limite,
        });

      return res.json(resultado);
    } catch (error) {
      console.error(
        "Error ejecutando Orquestador SalesIA:",
        error
      );

      return res.status(500).json({
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "No se pudo ejecutar el Orquestador SalesIA",
      });
    }
  }
);

export default router;