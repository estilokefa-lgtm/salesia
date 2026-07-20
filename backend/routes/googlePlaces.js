import express from "express";
import { ejecutarProspector } from "../agents/prospector/prospectorAgent.js";

const router = express.Router();

router.post("/buscar-empresas", async (req, res) => {
  try {
    const respuesta = await ejecutarProspector(req.body);

    res.json({
      ok: true,
      ...respuesta,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

export default router;