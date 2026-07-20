import Card from "../../components/ui/Card";
import { useState } from "react";
import Button from "../../components/ui/Button";

export default function DashboardPage() {
  const [ejecutando, setEjecutando] =
  useState(false);

const [resultado, setResultado] =
  useState<any>(null);

async function ejecutarOrquestador() {
  try {
    setEjecutando(true);

    const response =
      await fetch(
        "http://localhost:3001/api/orquestador/ejecutar",
        {
          method: "POST",
        }
      );

    const data =
      await response.json();

    setResultado(data);

  } catch (error) {

    console.error(error);

    alert(
      "No se pudo ejecutar el Orquestador."
    );

  } finally {

    setEjecutando(false);

  }
}
  return (
    <div className="p-8">

      <h1 className="
        text-3xl
        font-bold
        text-gray-900
      ">
        Dashboard
      </h1>


      <p className="
        mt-2
        text-gray-500
      ">
        Bienvenido a SalesIA.
      </p>
      <div className="mt-6 flex items-center gap-4">

      <Button
  onClick={ejecutarOrquestador}
>
  {ejecutando
    ? "Analizando..."
    : "▶ Ejecutar Orquestador IA"}
</Button>

</div>


      <div
        className="
          mt-8
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
        "
      >

        <Card
          title="Clientes"
          value="0"
        />

        <Card
          title="Productos"
          value="0"
        />

        <Card
          title="Conversaciones"
          value="0"
        />

        <Card
          title="Ventas"
          value="$0"
        />

      </div>
      {resultado && (
  <div className="mt-8 rounded-lg border p-6 bg-white">

    <h2 className="text-xl font-bold mb-4">
      Última ejecución
    </h2>

    <p>
      Clientes analizados: {resultado.resumen.clientes_analizados}
    </p>

    <p>
      Tareas creadas: {resultado.resumen.tareas_creadas}
    </p>

    <p>
      Oportunidades altas: {resultado.resumen.oportunidades_altas}
    </p>

    <p>
      Oportunidades medias: {resultado.resumen.oportunidades_medias}
    </p>

    <p>
      Oportunidades bajas: {resultado.resumen.oportunidades_bajas}
    </p>

    <p>
      Duración: {(resultado.resumen.duracion_ms / 1000).toFixed(1)} segundos
    </p>

  </div>
)}

    </div>
  );
}