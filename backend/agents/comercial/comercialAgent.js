import {
  ejecutarMotorIA,
} from "../motorIA/motorIA.js";

import {
  crearTareaIA,
} from "../../services/tareasService.js";

/*
|--------------------------------------------------------------------------
| UTILIDADES
|--------------------------------------------------------------------------
*/

function limpiarJson(texto = "") {
  const limpio = String(texto)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const inicio =
    limpio.indexOf("{");

  const fin =
    limpio.lastIndexOf("}");

  if (
    inicio === -1 ||
    fin === -1
  ) {
    throw new Error(
      "El Agente Comercial no devolvió un JSON válido"
    );
  }

  try {
    return JSON.parse(
      limpio.slice(
        inicio,
        fin + 1
      )
    );
  } catch {
    throw new Error(
      "El Agente Comercial devolvió un JSON mal formado"
    );
  }
}

function normalizarPrioridad(
  prioridad
) {
  const valor = String(
    prioridad || ""
  )
    .trim()
    .toLowerCase();

  if (valor === "alta") {
    return "Alta";
  }

  if (valor === "baja") {
    return "Baja";
  }

  return "Media";
}

function normalizarScore(score) {
  const valor =
    Number(score);

  if (
    !Number.isFinite(valor)
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(valor)
    )
  );
}

function normalizarBooleano(
  valor
) {
  if (valor === true) {
    return true;
  }

  if (
    typeof valor === "string"
  ) {
    return (
      valor
        .trim()
        .toLowerCase() ===
      "true"
    );
  }

  return false;
}

function limitarDiasSeguimiento(
  valor
) {
  const dias =
    Number(valor);

  if (
    !Number.isFinite(dias)
  ) {
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

function normalizarCanal(
  canal
) {
  const valor = String(
    canal || ""
  )
    .trim()
    .toLowerCase();

  if (
    valor.includes(
      "whatsapp"
    )
  ) {
    return "WhatsApp";
  }

  if (
    valor.includes("email") ||
    valor.includes("correo")
  ) {
    return "Email";
  }

  if (
    valor.includes(
      "llamada"
    ) ||
    valor.includes(
      "teléfono"
    ) ||
    valor.includes(
      "telefono"
    )
  ) {
    return "Llamada";
  }

  return "Seguimiento";
}

function resolverCanalDisponible({
  canalRecomendado,
  cliente,
}) {
  const canal =
    normalizarCanal(
      canalRecomendado
    );

  const tieneTelefono =
    Boolean(
      String(
        cliente?.telefono || ""
      ).trim()
    );

  const tieneEmail =
    Boolean(
      String(
        cliente?.email || ""
      ).trim()
    );

  if (
    canal === "WhatsApp" &&
    tieneTelefono
  ) {
    return "WhatsApp";
  }

  if (
    canal === "Llamada" &&
    tieneTelefono
  ) {
    return "Llamada";
  }

  if (
    canal === "Email" &&
    tieneEmail
  ) {
    return "Email";
  }

  /*
   * Canal alternativo:
   * como la IA genera contenido
   * para WhatsApp, email y llamada,
   * podemos usar otro canal disponible.
   */

  if (tieneTelefono) {
    return "WhatsApp";
  }

  if (tieneEmail) {
    return "Email";
  }

  return "Seguimiento";
}

function obtenerTipoTarea(
  canal
) {
  switch (
    normalizarCanal(canal)
  ) {
    case "WhatsApp":
      return "whatsapp";

    case "Email":
      return "email";

    case "Llamada":
      return "llamada";

    default:
      return "seguimiento";
  }
}

function obtenerAccionTarea(
  canal
) {
  switch (
    normalizarCanal(canal)
  ) {
    case "WhatsApp":
      return "Abrir WhatsApp";

    case "Email":
      return "Enviar email";

    case "Llamada":
      return "Llamar";

    default:
      return "Abrir cliente";
  }
}

function obtenerTituloTarea({
  canal,
  nombreCliente,
}) {
  const nombre =
    nombreCliente ||
    "cliente";

  switch (
    normalizarCanal(canal)
  ) {
    case "WhatsApp":
      return `Enviar WhatsApp a ${nombre}`;

    case "Email":
      return `Enviar email a ${nombre}`;

    case "Llamada":
      return `Llamar a ${nombre}`;

    default:
      return `Realizar seguimiento a ${nombre}`;
  }
}

function obtenerNombreCliente(
  cliente
) {
  return (
    cliente?.empresa ||
    cliente?.nombre ||
    "Cliente"
  );
}

/*
|--------------------------------------------------------------------------
| AGENTE COMERCIAL
|--------------------------------------------------------------------------
*/

export async function ejecutarAgenteComercial({
  clientes,
  memorias = [],
}) {
  if (
    !Array.isArray(clientes)
  ) {
    throw new Error(
      "La lista de clientes es obligatoria"
    );
  }

  if (
    clientes.length === 0
  ) {
    return {
      agente: "Comercial",

      resumen: {
        clientes_analizados: 0,
        oportunidades_altas: 0,
        oportunidades_medias: 0,
        oportunidades_bajas: 0,
      },

      oportunidades: [],

      tareas_creadas: 0,

      oportunidades_omitidas: 0,
    };
  }

  /*
   * El Agente Comercial:
   *
   * 1. Analiza la cartera.
   * 2. Prioriza oportunidades.
   * 3. Decide si corresponde actuar.
   * 4. Define el objetivo del vendedor.
   * 5. Genera materiales comerciales.
   * 6. Crea tareas para el Agente Vendedor.
   */

  const resultado =
    await ejecutarMotorIA({
      instrucciones: `
Sos el Agente Comercial de SalesIA.

Tu función es dirigir y organizar el trabajo del Agente Vendedor.

No sos solamente un generador de mensajes.

Debés analizar la cartera de clientes B2B, detectar oportunidades reales, establecer prioridades y decidir qué acciones comerciales deben ejecutarse ahora.

Debés evaluar:

- score del cliente;
- estado del cliente;
- etapa del pipeline;
- interés comercial;
- origen del cliente;
- última actividad;
- próxima fecha de contacto;
- valor estimado;
- observaciones;
- análisis IA previo;
- clasificación comercial;
- recomendación anterior;
- última conversación disponible;
- próxima acción recomendada anteriormente;
- disponibilidad de teléfono y email.

Reglas generales:

- No inventes información.
- Priorizá señales comerciales concretas.
- Penalizá clientes sin información suficiente.
- No asignes prioridad Alta únicamente por tener un score alto.
- Evitá recomendar contactos innecesarios o repetitivos.
- La acción sugerida debe ser concreta y ejecutable.
- El objetivo del vendedor debe indicar claramente qué resultado comercial debe buscar.
- ejecutar_vendedor debe ser true solamente cuando exista una acción comercial útil para realizar ahora.
- Si la prioridad es Alta o Media y el score es igual o superior a 70, normalmente ejecutar_vendedor debe ser true.
- Si la prioridad es Baja, normalmente ejecutar_vendedor debe ser false.
- Si faltan datos suficientes para contactar, ejecutar_vendedor debe ser false.
- Si no hay teléfono, no recomiendes WhatsApp ni Llamada como canal principal.
- Si no hay email, no recomiendes Email como canal principal.
- dias_hasta_seguimiento debe ser un número entero entre 0 y 30.
- Ordená las oportunidades desde la más importante hasta la menos importante.

Para cada oportunidad completá siempre:

- mensaje_whatsapp;
- asunto_email;
- cuerpo_email;
- guion_llamada.

Reglas para los mensajes:

- El mensaje de WhatsApp debe ser breve, natural, profesional y listo para enviar.
- El asunto del email debe ser breve, comercial y profesional.
- El cuerpo del email debe estar listo para enviar.
- El guion de llamada debe incluir:
  - presentación;
  - motivo del contacto;
  - pregunta comercial;
  - próximo paso.
- No prometas descuentos, precios ni condiciones no informadas.
- No uses frases genéricas innecesarias.
- Adaptá el contacto a la información disponible del cliente.
- Aunque el canal recomendado sea uno en particular, completá los cuatro campos comerciales.

Respondé exclusivamente con un objeto JSON válido.

No uses markdown.

No agregues explicaciones antes ni después del JSON.

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
      "prioridad": "Alta",
      "score": 0,
      "ejecutar_vendedor": true,
      "motivo": "Motivo claro y breve",
      "accion_recomendada": "Acción comercial concreta",
      "objetivo_vendedor": "Resultado que debe buscar el Agente Vendedor",
      "canal_recomendado": "WhatsApp",
      "dias_hasta_seguimiento": 3,
      "mensaje_whatsapp": "Mensaje breve y listo para enviar",
      "asunto_email": "Asunto breve y comercial",
      "cuerpo_email": "Cuerpo profesional del email listo para enviar",
      "guion_llamada": "Guion breve con apertura, motivo, pregunta y próximo paso"
    }
  ]
}
      `,

      entrada: `
CLIENTES DISPONIBLES:

${JSON.stringify(
  clientes,
  null,
  2
)}

MEMORIAS COMERCIALES DISPONIBLES:

${JSON.stringify(
  memorias,
  null,
  2
)}

Analizá la cartera completa.

Seleccioná únicamente las oportunidades relevantes.

Definí qué clientes deberían ser trabajados por el Agente Vendedor ahora.

Devolvé las oportunidades ordenadas desde la prioridad más alta hasta la más baja.
      `,
    });

  console.log(
    "========== RESPUESTA AGENTE COMERCIAL =========="
  );

  console.log(
    resultado.texto
  );

  console.log(
    "================================================"
  );

  const contenido =
    limpiarJson(
      resultado.texto
    );

  const oportunidadesOriginales =
    Array.isArray(
      contenido.oportunidades
    )
      ? contenido.oportunidades
      : [];

  /*
   * Normalizamos todas las respuestas
   * para evitar errores por mayúsculas,
   * strings o valores fuera de rango.
   */

  const oportunidades =
    oportunidadesOriginales.map(
      (oportunidad) => ({
        cliente_id:
          oportunidad.cliente_id ??
          null,

        cliente:
          oportunidad.cliente ||
          "Cliente",

        prioridad:
          normalizarPrioridad(
            oportunidad.prioridad
          ),

        score:
          normalizarScore(
            oportunidad.score
          ),

        ejecutar_vendedor:
          normalizarBooleano(
            oportunidad.ejecutar_vendedor
          ),

        motivo:
          oportunidad.motivo ||
          "",

        accion_recomendada:
          oportunidad.accion_recomendada ||
          "",

        objetivo_vendedor:
          oportunidad.objetivo_vendedor ||
          oportunidad.accion_recomendada ||
          "Realizar contacto comercial y detectar necesidades.",

        canal_recomendado:
          normalizarCanal(
            oportunidad.canal_recomendado
          ),

        dias_hasta_seguimiento:
          limitarDiasSeguimiento(
            oportunidad.dias_hasta_seguimiento
          ),

        mensaje_whatsapp:
          oportunidad.mensaje_whatsapp ||
          "",

        asunto_email:
          oportunidad.asunto_email ||
          "",

        cuerpo_email:
          oportunidad.cuerpo_email ||
          "",

        guion_llamada:
          oportunidad.guion_llamada ||
          "",
      })
    );

  const tareasCreadas = [];

  let oportunidadesOmitidas =
    0;

  /*
   * Solo creamos tareas para las
   * oportunidades que deben ser
   * trabajadas por el vendedor.
   */

  for (
    const oportunidad
    of oportunidades
  ) {
    if (
      !oportunidad.ejecutar_vendedor
    ) {
      oportunidadesOmitidas += 1;

      console.log(
        `Oportunidad omitida por decisión comercial: cliente ${oportunidad.cliente_id}`
      );

      continue;
    }

    if (
      oportunidad.cliente_id ===
        null ||
      oportunidad.cliente_id ===
        undefined
    ) {
      oportunidadesOmitidas += 1;

      console.warn(
        "Oportunidad omitida porque no posee cliente_id:",
        oportunidad
      );

      continue;
    }

    try {
      const clienteCompleto =
        clientes.find(
          (cliente) =>
            Number(cliente.id) ===
            Number(
              oportunidad.cliente_id
            )
        );

      if (!clienteCompleto) {
        oportunidadesOmitidas +=
          1;

        console.warn(
          `No se encontró el cliente ${oportunidad.cliente_id} en la cartera`
        );

        continue;
      }

      const canalFinal =
        resolverCanalDisponible({
          canalRecomendado:
            oportunidad.canal_recomendado,

          cliente:
            clienteCompleto,
        });

      const tipo =
        obtenerTipoTarea(
          canalFinal
        );

      const nombreCliente =
        obtenerNombreCliente(
          clienteCompleto
        );

      console.log(
        "CLIENTE:",
        nombreCliente
      );

      console.log(
        "CANAL RECOMENDADO:",
        oportunidad.canal_recomendado
      );

      console.log(
        "CANAL FINAL:",
        canalFinal
      );

      console.log(
        "TIPO DE TAREA:",
        tipo
      );
      if (
        oportunidad.ejecutar_vendedor
      ) {
        console.log(
          `La oportunidad de ${nombreCliente} será gestionada por el Vendedor IA. No se crea tarea Comercial.`
        );
      
        continue;
      }

      const resultadoTarea =
        await crearTareaIA({
          cliente_id:
            clienteCompleto.id,

          agente:
            "Comercial",

          tipo,

          titulo:
            obtenerTituloTarea({
              canal:
                canalFinal,

              nombreCliente,
            }),

          descripcion:
            oportunidad.accion_recomendada ||
            oportunidad.motivo ||
            "Revisar oportunidad comercial detectada por SalesIA.",

          prioridad:
            oportunidad.prioridad,

          estado:
            "Pendiente",

          accion:
            obtenerAccionTarea(
              canalFinal
            ),

          ruta:
            `/clientes?cliente=${clienteCompleto.id}`,

          responsable:
            "Vendedor",

          payload: {
            cliente: {
              id:
                clienteCompleto.id,

              nombre:
                clienteCompleto.nombre ||
                "",

              empresa:
                clienteCompleto.empresa ||
                nombreCliente,
            },

            telefono:
              clienteCompleto.telefono ||
              "",

            email:
              clienteCompleto.email ||
              "",

            ciudad:
              clienteCompleto.ciudad ||
              "",

            interes:
              clienteCompleto.interes ||
              "",

            pipeline:
              clienteCompleto.pipeline ||
              "",

            score:
              oportunidad.score,

            prioridad:
              oportunidad.prioridad,

            ejecutar_vendedor:
              oportunidad.ejecutar_vendedor,

            motivo:
              oportunidad.motivo,

            accion_recomendada:
              oportunidad.accion_recomendada,

            objetivo_vendedor:
              oportunidad.objetivo_vendedor,

            canal_recomendado:
              oportunidad.canal_recomendado,

            canal_final:
              canalFinal,

            dias_hasta_seguimiento:
              oportunidad.dias_hasta_seguimiento,

            mensaje_whatsapp:
              oportunidad.mensaje_whatsapp,

            asunto_email:
              oportunidad.asunto_email,

            cuerpo_email:
              oportunidad.cuerpo_email,

            guion_llamada:
              oportunidad.guion_llamada,

            origen:
              "Agente Comercial",
          },
        });

      /*
       * crearTareaIA puede impedir
       * duplicados y devolver creada false.
       */

      if (
        resultadoTarea?.creada
      ) {
        tareasCreadas.push(
          resultadoTarea.tarea
        );

        console.log(
          `Tarea creada para ${nombreCliente}`
        );
      } else {
        console.log(
          `No se creó una nueva tarea para ${nombreCliente}. Posible duplicado.`
        );
      }
    } catch (error) {
      oportunidadesOmitidas +=
        1;

      console.error(
        `No se pudo crear la tarea del cliente ${oportunidad.cliente_id}:`,
        error
      );
    }
  }

  /*
   * Recalculamos el resumen usando
   * los valores normalizados.
   */

  const resumenCalculado = {
    clientes_analizados:
      clientes.length,

    oportunidades_altas:
      oportunidades.filter(
        (oportunidad) =>
          oportunidad.prioridad ===
          "Alta"
      ).length,

    oportunidades_medias:
      oportunidades.filter(
        (oportunidad) =>
          oportunidad.prioridad ===
          "Media"
      ).length,

    oportunidades_bajas:
      oportunidades.filter(
        (oportunidad) =>
          oportunidad.prioridad ===
          "Baja"
      ).length,
  };

  return {
    agente:
      "Comercial",

    proveedor:
      resultado.proveedor,

    modelo:
      resultado.modelo,

    resumen:
      resumenCalculado,

    oportunidades,

    tareas_creadas:
      tareasCreadas.length,

    oportunidades_omitidas:
      oportunidadesOmitidas,

    tareas:
      tareasCreadas,
  };
}