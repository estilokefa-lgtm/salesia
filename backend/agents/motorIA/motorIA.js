import OpenAI from "openai";

export async function ejecutarMotorIA({
  instrucciones,
  entrada,
  modelo = "gpt-5-mini",
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Falta configurar OPENAI_API_KEY");
  }

  if (!instrucciones?.trim()) {
    throw new Error("Las instrucciones son obligatorias");
  }

  if (!entrada?.trim()) {
    throw new Error("La entrada es obligatoria");
  }

  const openai = new OpenAI({
    apiKey,
  });

  const respuesta = await openai.responses.create({
    model: modelo,
    instructions: instrucciones,
    input: entrada,
  });

  const texto = respuesta.output_text?.trim();

  if (!texto) {
    throw new Error("La IA no devolvió contenido");
  }

  return {
    proveedor: "OpenAI",
    modelo,
    texto,
  };
}