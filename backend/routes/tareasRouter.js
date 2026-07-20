import { Router } from "express";

import {
  listarTareasIA,
  obtenerTareaIA,
  completarTareaIA,
  actualizarEstadoTareaIA,
  eliminarTareaIA,
} from "../services/tareasService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const estado =
      typeof req.query.estado === "string"
        ? req.query.estado
        : "Pendiente";

    const limiteSolicitado = Number(req.query.limite);

    const limite =
      Number.isInteger(limiteSolicitado) &&
      limiteSolicitado > 0
        ? Math.min(limiteSolicitado, 500)
        : 100;

    const tareas = await listarTareasIA({
      estado:
        estado === "Todas"
          ? null
          : estado,
      limite,
    });

    res.json({
      ok: true,
      tareas,
    });
  } catch (error) {
    console.error(
      "Error listando tareas IA:",
      error
    );

    res.status(500).json({
      ok: false,
      error:
        error.message ||
        "No se pudieron recuperar las tareas IA",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const tarea = await obtenerTareaIA(
      req.params.id
    );

    res.json({
      ok: true,
      tarea,
    });
  } catch (error) {
    console.error(
      "Error recuperando tarea IA:",
      error
    );

    res.status(404).json({
      ok: false,
      error:
        error.message ||
        "No se encontró la tarea IA",
    });
  }
});

router.patch("/:id/estado", async (req, res) => {
  try {
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        ok: false,
        error: "El estado es obligatorio",
      });
    }

    const tarea =
      await actualizarEstadoTareaIA(
        req.params.id,
        estado
      );

    res.json({
      ok: true,
      tarea,
    });
  } catch (error) {
    console.error(
      "Error actualizando estado de tarea IA:",
      error
    );

    res.status(400).json({
      ok: false,
      error:
        error.message ||
        "No se pudo actualizar la tarea IA",
    });
  }
});

router.patch("/:id/completar", async (req, res) => {
  try {
    const tarea = await completarTareaIA(
      req.params.id
    );

    res.json({
      ok: true,
      tarea,
    });
  } catch (error) {
    console.error(
      "Error completando tarea IA:",
      error
    );

    res.status(500).json({
      ok: false,
      error:
        error.message ||
        "No se pudo completar la tarea IA",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await eliminarTareaIA(
      req.params.id
    );

    res.json({
      ok: true,
      message: "Tarea eliminada correctamente",
    });
  } catch (error) {
    console.error(
      "Error eliminando tarea IA:",
      error
    );

    res.status(500).json({
      ok: false,
      error:
        error.message ||
        "No se pudo eliminar la tarea IA",
    });
  }
});

export default router;