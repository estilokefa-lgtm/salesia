import { useState } from "react";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";


type Cliente = {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
};


type Props = {
  onSave: (cliente: Cliente) => void;
};


export default function ClienteForm({
  onSave,
}: Props) {


  const [cliente, setCliente] = useState<Cliente>({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
  });



  const actualizar = (
    campo: keyof Cliente,
    valor: string
  ) => {

    setCliente({
      ...cliente,
      [campo]: valor,
    });

  };



  return (

    <div className="
      flex
      flex-col
      gap-4
    ">


      <Input
        label="Nombre"
        placeholder="Nombre del cliente"
        value={cliente.nombre}
        onChange={(e)=>
          actualizar(
            "nombre",
            e.target.value
          )
        }
      />


      <Input
        label="Empresa"
        placeholder="Empresa"
        value={cliente.empresa}
        onChange={(e)=>
          actualizar(
            "empresa",
            e.target.value
          )
        }
      />


      <Input
        label="Email"
        placeholder="correo@empresa.com"
        value={cliente.email}
        onChange={(e)=>
          actualizar(
            "email",
            e.target.value
          )
        }
      />


      <Input
        label="Teléfono"
        placeholder="Número"
        value={cliente.telefono}
        onChange={(e)=>
          actualizar(
            "telefono",
            e.target.value
          )
        }
      />



      <Button
        onClick={()=>{
          onSave(cliente);

          setCliente({
            nombre:"",
            empresa:"",
            email:"",
            telefono:"",
          });

        }}
      >
        Guardar cliente
      </Button>



    </div>

  );

}