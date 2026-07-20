import { useEffect, useState } from "react";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import type { Cliente } from "../types";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";



type Props = {
  cliente?: Cliente | null;
  onSave: (cliente: Cliente) => void;
};

export default function ClienteForm({
  cliente,
  onSave,
}: Props) {
  const [form, setForm] = useState<Cliente>({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    estado: "Prospecto",
    interes: "",
    origen: "WhatsApp",
    observaciones: "",
  });

  useEffect(() => {
    if (cliente) {
      setForm(cliente);
    } else {
      setForm({
        nombre: "",
        empresa: "",
        email: "",
        telefono: "",
      });
    }
  }, [cliente]);

  function actualizar(
    campo: keyof Cliente,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function guardar() {
    onSave(form);

    if (!cliente) {
      setForm({
        nombre: "",
        empresa: "",
        email: "",
        telefono: "",
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Nombre"
        value={form.nombre}
        placeholder="Nombre del cliente"
        onChange={(e) => actualizar("nombre", e.target.value)}
      />

      <Input
        label="Empresa"
        value={form.empresa}
        placeholder="Empresa"
        onChange={(e) => actualizar("empresa", e.target.value)}
      />

      <Input
        label="Email"
        value={form.email}
        placeholder="correo@empresa.com"
        onChange={(e) => actualizar("email", e.target.value)}
      />

      <Input
        label="Teléfono"
        value={form.telefono}
        placeholder="Número"
        onChange={(e) => actualizar("telefono", e.target.value)}
      />
      <Select
  label="Estado"
  value={form.estado}
  onChange={(e) => actualizar("estado", e.target.value)}
  options={[
    { value: "Prospecto", label: "Prospecto" },
    { value: "Contactado", label: "Contactado" },
    { value: "Negociación", label: "Negociación" },
    { value: "Cliente", label: "Cliente" },
    { value: "Perdido", label: "Perdido" },
  ]}
/>

<Input
  label="Interés"
  placeholder="¿Qué busca el cliente?"
  value={form.interes ?? ""}
  onChange={(e) => actualizar("interes", e.target.value)}
/>

<Select
  label="Origen"
  value={form.origen}
  onChange={(e) => actualizar("origen", e.target.value)}
  options={[
    { value: "WhatsApp", label: "WhatsApp" },
    { value: "Instagram", label: "Instagram" },
    { value: "Facebook", label: "Facebook" },
    { value: "Web", label: "Web" },
    { value: "Referido", label: "Referido" },
    { value: "Llamada", label: "Llamada" },
    { value: "Otro", label: "Otro" },
  ]}
/>

<Textarea
  label="Observaciones"
  rows={4}
  value={form.observaciones ?? ""}
  onChange={(e) => actualizar("observaciones", e.target.value)}
/>

      <Button onClick={guardar}>
        {cliente ? "Actualizar cliente" : "Guardar cliente"}
      </Button>
    </div>
  );
}