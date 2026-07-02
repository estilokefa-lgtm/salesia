import Card from "../../components/ui/Card";

export default function DashboardPage() {
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

    </div>
  );
}