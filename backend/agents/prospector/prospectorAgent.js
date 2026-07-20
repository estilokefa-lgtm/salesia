import { buscarEmpresasGoogle } from "../../services/googlePlacesService.js";
import { ejecutarMotorIA } from "../motorIA/motorIA.js";

function calcularScoreComercial(empresa) {
  let score = Number(empresa.score) || 50;

  if (empresa.telefono) {
    score += 4;
  }

  if (empresa.web) {
    score += 5;
  }

  if (empresa.observaciones) {
    score += 1;
  }

  return Math.min(score, 100);
}

function clasificarOportunidad(score) {
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Muy buena";
  if (score >= 70) return "Buena";

  return "Baja";
}

function recomendacionInicial(score) {
  if (score >= 90) {
    return "Priorizar contacto comercial inmediato.";
  }

  if (score >= 80) {
    return "Contactar durante los próximos días.";
  }

  if (score >= 70) {
    return "Revisar información antes de contactar.";
  }

  return "Oportunidad de baja prioridad.";
}

function extraerJson(texto) {
  const limpio = texto
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const inicio = limpio.indexOf("[");
  const fin = limpio.lastIndexOf("]");

  if (inicio === -1 || fin === -1) {
    throw new Error("La IA no devolvió un JSON válido");
  }

  return JSON.parse(limpio.slice(inicio, fin + 1));
}

async function analizarMejoresEmpresas(empresas, rubro, ciudad) {
  if (empresas.length === 0) {
    return [];
  }

  const datos = empresas.map((empresa, index) => ({
    indice: index,
    empresa: empresa.empresa,
    telefono: empresa.telefono || "No disponible",
    web: empresa.web || "No disponible",
    direccion: empresa.observaciones || "No disponible",
    score: empresa.score,
    clasificacion: empresa.clasificacion,
  }));

  const resultado = await ejecutarMotorIA({
    instrucciones: `
Sos un agente comercial especializado en prospección B2B.

Analizá empresas potenciales para un CRM de ventas llamado SalesIA.

Debés responder exclusivamente con un array JSON válido.
No uses markdown.
No agregues texto antes ni después del JSON.

Cada elemento debe tener exactamente esta estructura:

{
  "indice": 0,
  "analisis": "Resumen comercial breve de la oportunidad",
  "recomendacion": "Próxima acción comercial concreta"
}

Las recomendaciones deben ser breves, realistas y accionables.
No inventes información que no aparece en los datos.
Respondé en español.
    `,
    entrada: `
Rubro buscado: ${rubro}
Ciudad buscada: ${ciudad}

Empresas para analizar:

${JSON.stringify(datos, null, 2)}
    `,
  });

  return extraerJson(resultado.texto);
}

export async function ejecutarProspector({
  rubro,
  ciudad,
  cantidad,
}) {
  if (!rubro?.trim()) {
    throw new Error("El rubro es obligatorio");
  }

  if (!ciudad?.trim()) {
    throw new Error("La ciudad es obligatoria");
  }

  const rubroLimpio = rubro.trim();
  const ciudadLimpia = ciudad.trim();

  const empresasGoogle = await buscarEmpresasGoogle({
    rubro: rubroLimpio,
    ciudad: ciudadLimpia,
    cantidad,
  });

  const resultados = empresasGoogle
    .map((empresa) => {
      const scoreComercial = calcularScoreComercial(empresa);

      return {
        ...empresa,
        score: scoreComercial,
        clasificacion: clasificarOportunidad(scoreComercial),
        recomendacion: recomendacionInicial(scoreComercial),
        ultimo_analisis_ia: "",
      };
    })
    .sort((a, b) => b.score - a.score);

  /*
   * Analizamos solo las cinco mejores empresas.
   * Se hace una única llamada a OpenAI.
   */
  const cantidadAnalizada = Math.min(5, resultados.length);
  const mejoresEmpresas = resultados.slice(0, cantidadAnalizada);

  try {
    const analisisIA = await analizarMejoresEmpresas(
      mejoresEmpresas,
      rubroLimpio,
      ciudadLimpia
    );

    for (const analisis of analisisIA) {
      const indice = Number(analisis.indice);

      if (
        Number.isInteger(indice) &&
        indice >= 0 &&
        indice < cantidadAnalizada
      ) {
        resultados[indice] = {
          ...resultados[indice],
          ultimo_analisis_ia:
            typeof analisis.analisis === "string"
              ? analisis.analisis
              : "",
          recomendacion:
            typeof analisis.recomendacion === "string"
              ? analisis.recomendacion
              : resultados[indice].recomendacion,
        };
      }
    }
  } catch (error) {
    /*
     * Si OpenAI falla, la búsqueda no se interrumpe.
     * Se devuelven las recomendaciones basadas en reglas.
     */
    console.error(
      "El Prospector continuó sin análisis IA:",
      error
    );
  }

  return {
    agente: "Prospector",
    consulta: {
      rubro: rubroLimpio,
      ciudad: ciudadLimpia,
      cantidad: Number(cantidad) || 10,
    },
    totalEncontrados: resultados.length,
    totalAnalizadosIA: cantidadAnalizada,
    resultados,
  };
}