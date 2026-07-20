import { ejecutarMotorIA } from "../motorIA/motorIA.js";
import {
  crearTareaIA,
} from "../../services/tareasService.js";

function limpiarJson(texto) {
  const limpio = texto
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const inicio = limpio.indexOf("{");
  const fin = limpio.lastIndexOf("}");

  if (inicio === -1 || fin === -1) {
    throw new Error(
      "El Agente Comercial no devolvió un JSON válido"
    );
  }

  try {
    return JSON.parse(
      limpio.slice(inicio, fin + 1)
    );
  } catch {
    throw new Error(
      "El Agente Comercial devolvió un JSON mal formado"
    );
  }
}

function obtenerTipoTarea(canal) {
  const canalNormalizado = String(canal || "")
    .trim()
    .toLowerCase();

  if (canalNormalizado.includes("whatsapp")) {
    return "whatsapp";
  }

  if (
    canalNormalizado.includes("email") ||
    canalNormalizado.includes("correo")
  ) {
    return "email";
  }

  if (
    canalNormalizado.includes("llamada") ||
    canalNormalizado.includes("teléfono") ||
    canalNormalizado.includes("telefono")
  ) {
    return "llamada";
  }

  return "seguimiento";
}

export async function ejecutarAgenteComercial({
  clientes,
  memorias = [],
}) {
  if (!Array.isArray(clientes)) {
    throw new Error(
      "La lista de clientes es obligatoria"
    );
  }

  if (clientes.length === 0) {
    return {
      resumen: {
        clientes_analizados: 0,
        oportunidades_altas: 0,
        oportunidades_medias: 0,
        oportunidades_bajas: 0,
      },
      oportunidades: [],
    };
  }

  const resultado = await ejecutarMotorIA({
    instrucciones: `
Sos el Agente Comercial de SalesIA.

Tu función es analizar una cartera de clientes B2B y detectar oportunidades comerciales.

Debés evaluar:
- score del cliente;
- estado y etapa del pipeline;
- interés comercial;
- última actividad;
- próxima fecha de contacto;
- observaciones;
- análisis IA previo;
- última conversación o memoria disponible;
- próxima acción recomendada anteriormente.

Reglas:
- No inventes información.
- Priorizá clientes con señales comerciales concretas.
- Penalizá clientes sin información suficiente.
- No asignes prioridad alta solo porque tengan un score alto.
- Explicá claramente por qué cada cliente merece atención.
- La acción sugerida debe ser concreta y ejecutable.
- ejecutar_vendedor debe ser true únicamente cuando exista una acción comercial útil para realizar ahora.
- Si la prioridad es Alta o Media y el score es igual o superior a 70, normalmente ejecutar_vendedor debe ser true.
- Si la prioridad es Baja, ejecutar_vendedor debe ser false.
- Si faltan datos suficientes para contactar al cliente, ejecutar_vendedor debe ser false.

- Para cada oportunidad completá SIEMPRE:
  - mensaje_whatsapp
  - asunto_email
  - cuerpo_email
  - guion_llamada

- Generá un mensaje de WhatsApp breve, natural, profesional y listo para enviar.
- Generá un asunto de email atractivo y profesional.
- Generá un cuerpo de email listo para enviar.
- Generá un guion de llamada breve con:
  - presentación,
  - motivo del contacto,
  - próximo paso.

- Aunque el canal recomendado sea WhatsApp o Llamada, igualmente completá los cuatro campos.

- No uses markdown.
- Respondé exclusivamente con JSON válido.
- No agregues texto antes ni después del JSON.

La estructura debe ser exactamente:

{
  "resumen": {
    "clientes_analizados": 0,
    "oportunidades_altas": 0,
    "oportunidades_medias": 0,
    "oportunidades_bajas": 0
  },
  "oportunidades": [
    {
      "cliente_id": 0,
"cliente": "Nombre o empresa",
"prioridad": "Alta, Media o Baja",
"score": 0,
"ejecutar_vendedor": true,
"motivo": "Motivo claro y breve",
"accion_recomendada": "Acción comercial concreta",
"canal_recomendado": "WhatsApp, Email o Llamada",
"mensaje_whatsapp": "Mensaje breve, natural, profesional y listo para enviar",
"asunto_email": "Asunto breve y comercial",
"cuerpo_email": "Cuerpo profesional del email listo para enviar",
"guion_llamada": "Guion breve con apertura, motivo del contacto y próximo paso"
    }
  ]
}
    `,
    entrada: `
CLIENTES:

${JSON.stringify(clientes, null, 2)}

MEMORIAS COMERCIALES:

${JSON.stringify(memorias, null, 2)}

Analizá la cartera completa y devolvé las oportunidades ordenadas desde la prioridad más alta hasta la más baja.
    `,
  });
  console.log("========== RESPUESTA IA ==========");
  console.log(resultado.texto);
  console.log("==================================");
  const contenido = limpiarJson(
    resultado.texto
  );

  const oportunidades = (
    contenido.oportunidades || []
  ).map((oportunidad) => ({
    ...oportunidad,
  
    ejecutar_vendedor:
      oportunidad.ejecutar_vendedor === true,
  }));

  const tareasCreadas = [];

  for (const oportunidad of oportunidades) {
    try {
      const tipo = obtenerTipoTarea(
        oportunidad.canal_recomendado
      );

      console.log(
        "CANAL RECOMENDADO:",
        oportunidad.canal_recomendado
      );

      console.log(
        "TIPO CALCULADO:",
        tipo
      );
      const clienteCompleto = clientes.find(
        (cliente) =>
          Number(cliente.id) ===
          Number(oportunidad.cliente_id)
      );
      const resultadoTarea =
      await crearTareaIA({
        cliente_id:
          oportunidad.cliente_id ?? null,
    
        agente: "Comercial",
    
        tipo,
    
        titulo: oportunidad.cliente
          ? `Contactar a ${oportunidad.cliente}`
          : "Nueva oportunidad comercial",
    
        descripcion:
          oportunidad.accion_recomendada ||
          oportunidad.motivo ||
          "Revisar oportunidad comercial detectada por SalesIA.",
    
        prioridad:
          oportunidad.prioridad || "Media",
    
        accion: "Abrir cliente",
    
        ruta: oportunidad.cliente_id
          ? `/clientes?cliente=${oportunidad.cliente_id}`
          : "/clientes",
    
        payload: {
          cliente:
            oportunidad.cliente ?? null,
    
          telefono:
            clienteCompleto?.telefono ?? null,
    
          email:
            clienteCompleto?.email ?? null,
    
          score:
            oportunidad.score ?? null,
    
          ejecutar_vendedor:
            oportunidad.ejecutar_vendedor,
    
          motivo:
            oportunidad.motivo ?? null,
    
          accion_recomendada:
            oportunidad.accion_recomendada ?? null,
    
          canal_recomendado:
            oportunidad.canal_recomendado ?? null,
    
          mensaje_whatsapp:
            oportunidad.mensaje_whatsapp ?? null,
    
          asunto_email:
            oportunidad.asunto_email ?? null,
    
          cuerpo_email:
            oportunidad.cuerpo_email ?? null,
    
          guion_llamada:
            oportunidad.guion_llamada ?? null,
        },
      });
    
    if (resultadoTarea.creada) {
      tareasCreadas.push(
        resultadoTarea.tarea
      );
    }
    } catch (error) {
      console.error(
        `No se pudo crear la tarea del cliente ${oportunidad.cliente_id}:`,
        error
      );
    }
  }

  return {
    agente: "Comercial",
    proveedor: resultado.proveedor,
    modelo: resultado.modelo,

    resumen: contenido.resumen || {
      clientes_analizados:
        clientes.length,
      oportunidades_altas: 0,
      oportunidades_medias: 0,
      oportunidades_bajas: 0,
    },

    oportunidades,

    tareas_creadas:
      tareasCreadas.length,
  };
}