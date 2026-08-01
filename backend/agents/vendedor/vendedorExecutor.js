import {
  enviarPlantillaWhatsApp,
} from "../../services/whatsappService.js";

import {
  actualizarTareaIA,
} from "../../services/tareasService.js";

function normalizarCanal(
  canal = ""
) {
  return canal
    .toString()
    .trim()
    .toLowerCase();
}

function normalizarTelefonoWhatsApp(
  telefono = ""
) {
  let limpio =
    String(telefono)
      .replace(/\D/g, "");

  if (!limpio) {
    return "";
  }

  if (
    limpio.startsWith("0")
  ) {
    limpio =
      limpio.substring(1);
  }

  if (
    limpio.startsWith("15")
  ) {
    limpio =
      limpio.substring(2);
  }

  if (
    limpio.length === 10
  ) {
    limpio =
      `54${limpio}`;
  }
  
  if (
    limpio.startsWith("549") &&
    limpio.length === 13
  ) {
    limpio =
      `54${limpio.substring(3)}`;
  }

  return limpio;
}

export async function ejecutarAccionVendedor({
  cliente,
  decision,
  tarea,
}) {
  const canal =
    normalizarCanal(
      decision?.canal
    );

  if (!cliente?.id) {
    return {
      ok: false,
      ejecutado: false,
      requiere_accion_manual: true,
      canal,
      motivo:
        "No se recibió un cliente válido.",
    };
  }

  if (!decision) {
    return {
      ok: false,
      ejecutado: false,
      requiere_accion_manual: true,
      canal,
      motivo:
        "No se recibió una decisión del Vendedor IA.",
    };
  }

  switch (canal) {
    case "whatsapp": {
      const telefono =
        normalizarTelefonoWhatsApp(
          cliente.telefono
        );

      if (!telefono) {
        return {
          ok: false,
          ejecutado: false,
          requiere_accion_manual: true,
          canal: "WhatsApp",
          accion:
            "Completar teléfono",
          mensaje:
            decision.mensaje || "",
          telefono: "",
          tarea_id:
            tarea?.id ?? null,
          motivo:
            "El cliente no tiene un teléfono válido.",
        };
      }
      console.log("========== ENVÍO ==========");
console.log("Cliente:", cliente.nombre);
console.log("Teléfono original:", cliente.telefono);
console.log("Teléfono normalizado:", telefono);
console.log("===========================");

      try {
        const envio =
          await enviarPlantillaWhatsApp({
            telefono,
            plantilla:
              "hello_world",
            idioma:
              "en_US",
          });

        if (tarea?.id) {
          const payloadActual =
            tarea.payload &&
            typeof tarea.payload ===
              "object"
              ? tarea.payload
              : {};

          await actualizarTareaIA(
            tarea.id,
            {
              estado:
                "En proceso",

              payload: {
                ...payloadActual,

                whatsapp_enviado:
                  true,

                whatsapp_message_id:
                  envio.mensaje_id,

                whatsapp_enviado_at:
                  new Date()
                    .toISOString(),

                telefono_destino:
                  telefono,
              },
            }
          );
        }

        return {
          ok: true,
          ejecutado: true,
          requiere_accion_manual: false,
          canal:
            "WhatsApp",
          accion:
            "WhatsApp enviado",
          mensaje:
            decision.mensaje || "",
          telefono,
          tarea_id:
            tarea?.id ?? null,
          mensaje_id:
            envio.mensaje_id,
          motivo:
            "Mensaje enviado mediante WhatsApp Cloud API.",
        };
      } catch (error) {
        console.error(
          "Error ejecutando WhatsApp automático:",
          error
        );

        return {
          ok: false,
          ejecutado: false,
          requiere_accion_manual: true,
          canal:
            "WhatsApp",
          accion:
            "Revisar envío",
          mensaje:
            decision.mensaje || "",
          telefono,
          tarea_id:
            tarea?.id ?? null,
          motivo:
            error instanceof Error
              ? error.message
              : "No se pudo enviar el WhatsApp.",
        };
      }
    }

    case "email":
      return {
        ok: true,
        ejecutado: false,
        requiere_accion_manual: true,
        canal: "Email",
        accion:
          "Enviar email",
        destinatario:
          cliente.email || "",
        asunto:
          decision.asunto || "",
        mensaje:
          decision.mensaje || "",
        tarea_id:
          tarea?.id ?? null,
        motivo:
          "El envío automático por email todavía no está configurado.",
      };

    case "llamada":
      return {
        ok: true,
        ejecutado: false,
        requiere_accion_manual: true,
        canal: "Llamada",
        accion:
          "Realizar llamada",
        telefono:
          cliente.telefono || "",
        guion:
          decision.guion_llamada ||
          "",
        tarea_id:
          tarea?.id ?? null,
        motivo:
          "Las llamadas automáticas todavía no están configuradas.",
      };

    default:
      return {
        ok: true,
        ejecutado: false,
        requiere_accion_manual: true,
        canal:
          decision.canal ||
          "Seguimiento",
        accion:
          "Revisar cliente",
        tarea_id:
          tarea?.id ?? null,
        motivo:
          "El canal indicado requiere intervención manual.",
      };
  }
}