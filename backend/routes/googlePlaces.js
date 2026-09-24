import express from "express";
import { ejecutarProspector } from "../agents/prospector/prospectorAgent.js";
import { enriquecerContacto } from "../services/enriquecimientoContactosService.js";

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

router.post("/enriquecer-contacto", async (req, res) => {
  try {
    const { web } = req.body;

    if (!web) {
      return res.status(400).json({
        ok: false,
        error: "La web es obligatoria",
      });
    }

    const resultado = await enriquecerContacto(web);

    res.json({
      ok: true,
      resultado,
    });
  } catch (error) {
    console.error(
      "Error enriqueciendo contacto:",
      error
    );

    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

export default router;