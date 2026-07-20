import express from "express";
import { ejecutarMotorIA } from "../agents/motorIA/motorIA.js";

const router = express.Router();

router.post("/ia/probar", async (req, res) => {
  try {
    const { instrucciones, entrada } = req.body;

    const resultado = await ejecutarMotorIA({
      instrucciones:
        instrucciones ||
        "Respondé en español de forma breve, clara y comercial.",
      entrada,
    });

    res.json({
      ok: true,
      ...resultado,
    });
  } catch (error) {
    console.error("Error Motor IA:", error);

    res.status(500).json({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error ejecutando el Motor IA",
    });
  }
});

export default router;