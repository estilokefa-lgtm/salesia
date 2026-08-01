function obtenerConfiguracionWhatsApp() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v25.0";

  if (!accessToken) {
    throw new Error("Falta WHATSAPP_ACCESS_TOKEN en el archivo .env");
  }

  if (!phoneNumberId) {
    throw new Error("Falta WHATSAPP_PHONE_NUMBER_ID en el archivo .env");
  }

  return {
    accessToken,
    phoneNumberId,
    apiVersion,
  };
}

function normalizarTelefono(telefono) {
  return String(telefono || "").replace(/\D/g, "");
}

export async function enviarPlantillaWhatsApp({
  telefono,
  plantilla = "hello_world",
  idioma = "en_US",
  variables = [],
}) {
  const numeroDestino =
    normalizarTelefono(
      telefono
    );

  if (!numeroDestino) {
    throw new Error(
      "El teléfono de destino es obligatorio"
    );
  }

  const {
    accessToken,
    phoneNumberId,
    apiVersion,
  } = obtenerConfiguracionWhatsApp();

  const url =
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const componentes =
    variables.length > 0
      ? [
          {
            type: "body",
            parameters:
              variables.map(
                (valor) => ({
                  type: "text",
                  text:
                    String(valor),
                })
              ),
          },
        ]
      : [];

  const response =
    await fetch(url, {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        messaging_product:
          "whatsapp",

        recipient_type:
          "individual",

        to:
          numeroDestino,

        type:
          "template",

        template: {
          name:
            plantilla,

          language: {
            code:
              idioma,
          },

          ...(componentes.length > 0
            ? {
                components:
                  componentes,
              }
            : {}),
        },
      }),
    });

  const resultado =
    await response.json();

  if (!response.ok) {
    console.error(
      "Error de WhatsApp Cloud API:",
      resultado
    );

    throw new Error(
      resultado?.error?.message ||
        "No se pudo enviar el mensaje de WhatsApp"
    );
  }

  return {
    ok: true,

    mensaje_id:
      resultado?.messages?.[0]?.id ??
      null,

    contacto:
      resultado?.contacts?.[0] ??
      null,

    respuesta:
      resultado,
  };
}