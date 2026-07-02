const clientes = [
    {
      nombre: "Juan Pérez",
      empresa: "Empresa Demo",
      estado: "Lead",
    },
    {
      nombre: "María Gómez",
      empresa: "Kefa",
      estado: "Cliente",
    },
  ];
  
  
  export default function ClienteTable(){
  
    return (
  
      <div className="
        mt-8
        rounded-xl
        border
        bg-white
        overflow-hidden
      ">
  
        <table className="
          w-full
          text-left
        ">
  
  
          <thead className="bg-gray-50">
  
            <tr>
  
              <th className="p-4">
                Nombre
              </th>
  
              <th className="p-4">
                Empresa
              </th>
  
              <th className="p-4">
                Estado
              </th>
  
            </tr>
  
          </thead>
  
  
          <tbody>
  
            {clientes.map((cliente)=>(
              
              <tr
                key={cliente.nombre}
                className="border-t"
              >
  
                <td className="p-4">
                  {cliente.nombre}
                </td>
  
  
                <td className="p-4">
                  {cliente.empresa}
                </td>
  
  
                <td className="p-4">
                  {cliente.estado}
                </td>
  
  
              </tr>
  
            ))}
  
  
          </tbody>
  
  
        </table>
  
  
      </div>
  
    )
  
  }