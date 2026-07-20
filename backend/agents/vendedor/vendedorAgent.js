import {
  ejecutarMotorIA,
} from "../motorIA/motorIA.js";

function limpiarJson(texto) {
  const limpio = texto
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const inicio = limpio.indexOf("{");
  const fin = limpio.lastIndexOf("}");

  if (
    inicio === -1 ||
    fin === -1
  ) {
    throw new Error(
      "La IA no devolvió un JSON válido"
    );
  }

  try {
    return JSON.parse(
      limpio.slice(inicio, fin + 1)
    );
  } catch {
    throw new Error(
      "La IA devolvió un JSON mal formado"
    );
  }
}

function prepararHistorial(
  historial = []
) {
  if (
    !Array.isArray(historial) ||
    historial.length === 0
  ) {
    return "No existen conversaciones anteriores con este cliente.";
  }

  return historial
    .map((conversacion, index) => {
      return `
Interacción ${index + 1}

Fecha:
${conversacion.created_at || "Sin fecha"}

Pregunta u objetivo anterior:
${conversacion.pregunta || ""}

Respuesta anterior:
${conversacion.respuesta || ""}

Canal:
${conversacion.canal || ""}

Estrategia utilizada:
${conversacion.estrategia || ""}

Próxima acción recomendada:
${conversacion.proxima_accion || ""}
      `.trim();
    })
    .join(
      "\n\n--------------------\n\n"
    );
}

function limitarDiasSeguimiento(
  valor
) {
  const dias = Number(valor);

  if (!Number.isFinite(dias)) {
    return 3;
  }

  return Math.min(
    30,
    Math.max(
      0,
      Math.round(dias)
    )
  );
}

export async function ejecutarVendedor({
  cliente,
  objetivo,
  canal = "WhatsApp",
  historial = [],
}) {
  if (!cliente) {
    throw new Error(
      "Los datos del cliente son obligatorios"
    );
  }

  if (!objetivo?.trim()) {
    throw new Error(
      "El objetivo comercial es obligatorio"
    );
  }

  const datosCliente = {
    id: cliente.id,

    nombre:
      cliente.nombre ||
      "Sin contacto identificado",

    empresa:
      cliente.empresa ||
      "Sin empresa",

    telefono:
      cliente.telefono || "",

    email:
      cliente.email || "",

    ciudad:
      cliente.ciudad || "",

    interes:
      cliente.interes || "",

    estado:
      cliente.estado || "",

    pipeline:
      cliente.pipeline || "",

    observaciones:
      cliente.observaciones || "",

    analisisIA:
      cliente.ultimo_analisis_ia || "",

    score:
      cliente.score || null,

    clasificacion:
      cliente.clasificacion || "",

    recomendacion:
      cliente.recomendacion || "",
  };

  const memoriaCliente =
    prepararHistorial(historial);

  const resultado =
    await ejecutarMotorIA({
      instrucciones: `
Sos el Agente Vendedor de SalesIA.

Tu tarea es analizar al cliente, decidir la mejor acción comercial y redactar la comunicación correspondiente utilizando sus datos actuales y su historial.

Reglas:
- Usá un tono profesional, natural y cercano.
- No inventes datos.
- No prometas descuentos, precios ni condiciones no informadas.
- Evitá repetir mensajes o estrategias ya utilizados.
- Tené en cuenta las interacciones anteriores.
- Mantené continuidad con la relación comercial.
- Considerá la última próxima acción recomendada.
- Decidí si realmente corresponde contactar al cliente.
- Elegí el canal más adecuado según los datos disponibles.
- Si no hay teléfono, no elijas WhatsApp ni Llamada.
- Si no hay email, no elijas Email.
- Si no existe información suficiente para contactar, usá "Ninguno".
- La prioridad debe ser alta, media o baja.
- dias_hasta_seguimiento debe ser un número entero entre 0 y 30.
- crear_tarea debe ser false cuando no exista una acción comercial útil.
- Para una llamada, completá guion_llamada.
- Para WhatsApp o Email, completá mensaje.
- El mensaje debe ser breve y orientado al objetivo solicitado.
- Respondé exclusivamente con un objeto JSON válido.
- No uses markdown.
- No agregues texto antes ni después del JSON.

La estructura debe ser exactamente:

{
  "accion": "contactar, seguimiento, llamada, email, whatsapp o ninguna",
  "canal": "WhatsApp, Email, Llamada o Ninguno",
  "prioridad": "alta, media o baja",
  "asunto": "Asunto breve, vacío si no corresponde",
  "mensaje": "Mensaje comercial listo para revisar",
  "guion_llamada": "Guion breve para llamada, vacío si no corresponde",
  "estrategia": "Explicación breve del enfoque utilizado",
  "proxima_accion": "Siguiente paso recomendado",
  "dias_hasta_seguimiento": 3,
  "crear_tarea": true
}
      `,

      entrada: `
CANAL SUGERIDO INICIALMENTE:

${canal}

OBJETIVO ACTUAL:

${objetivo.trim()}

DATOS DISPONIBLES DEL CLIENTE:

${JSON.stringify(
  datosCliente,
  null,
  2
)}

HISTORIAL COMERCIAL DEL CLIENTE:

${memoriaCliente}

Analizá el caso y generá la mejor acción comercial posible.
      `,
    });

  const contenido =
    limpiarJson(resultado.texto);

  return {
    agente: "Vendedor",

    proveedor:
      resultado.proveedor,

    modelo:
      resultado.modelo,

    cliente:
      datosCliente,

    memoria_utilizada:
      historial.length,

    resultado: {
      accion:
        contenido.accion ||
        "contactar",

      canal:
        contenido.canal ||
        canal,

      prioridad:
        contenido.prioridad ||
        "media",

      asunto:
        contenido.asunto ||
        "",

      mensaje:
        contenido.mensaje ||
        "",

      guion_llamada:
        contenido.guion_llamada ||
        "",

      estrategia:
        contenido.estrategia ||
        "",

      proxima_accion:
        contenido.proxima_accion ||
        "",

      dias_hasta_seguimiento:
        limitarDiasSeguimiento(
          contenido.dias_hasta_seguimiento
        ),

      crear_tarea:
        contenido.crear_tarea !==
        false,
    },
  };
}