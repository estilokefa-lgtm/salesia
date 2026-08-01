import express from "express";

import {
  enviarPlantillaWhatsApp,
} from "../services/whatsappService.js";

const router = express.Router();

const WEBHOOK_VERIFY_TOKEN =
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

// =========================
// VERIFICAR WEBHOOK
// =========================

router.get(
  "/webhook",
  (req, res) => {
    const mode =
      req.query["hub.mode"];

    const token =
      req.query["hub.verify_token"];

    const challenge =
      req.query["hub.challenge"];

    if (
      mode === "subscribe" &&
      token ===
        WEBHOOK_VERIFY_TOKEN
    ) {
      console.log(
        "Webhook de WhatsApp verificado correctamente"
      );

      return res
        .status(200)
        .send(challenge);
    }

    console.warn(
      "Falló la verificación del webhook de WhatsApp"
    );

    return res.sendStatus(403);
  }
);

// =========================
// RECIBIR EVENTOS
// =========================

router.post(
  "/webhook",
  async (req, res) => {
    try {
      const evento =
        req.body;

      console.log(
        "========== WEBHOOK WHATSAPP =========="
      );

      console.dir(
        evento,
        {
          depth: null,
        }
      );

      console.log(
        "======================================"
      );

      // Respondemos rápido para que Meta
      // no reintente el mismo evento.
      return res.sendStatus(200);
    } catch (error) {
      console.error(
        "Error procesando webhook de WhatsApp:",
        error
      );

      return res.sendStatus(500);
    }
  }
);

// =========================
// RUTA DE PRUEBA
// =========================

router.post(
  "/probar",
  async (req, res) => {
    try {
      const telefono =
        req.body?.telefono ||
        process.env
          .WHATSAPP_TEST_RECIPIENT;

      const resultado =
        await enviarPlantillaWhatsApp({
          telefono,
        });

      return res.json({
        ok: true,
        resultado,
      });
    } catch (error) {
      console.error(
        "Error enviando WhatsApp:",
        error
      );

      return res
        .status(500)
        .json({
          ok: false,

          error:
            error instanceof Error
              ? error.message
              : "No se pudo enviar el WhatsApp",
        });
    }
  }
);

export default router;