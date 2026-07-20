import { useState } from "react";
import type { Cliente } from "../types";

import ClienteHeader from "./detalle/ClienteHeader";
import ClienteTabs from "./detalle/ClienteTabs";
import InformacionTab from "./detalle/InformacionTab";
import ConversacionesTab from "./detalle/ConversacionesTab";
import SeguimientosTab from "./detalle/SeguimientosTab";
import IATab from "./detalle/IATab";
import ClienteSidebar from "./detalle/ClienteSidebar";  

type Props = {
  cliente: Cliente;
};

export default function ClienteDetalle({ cliente }: Props) {
  const [tab, setTab] = useState("Información");

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <ClienteSidebar cliente={cliente} />
  
      <div className="space-y-6">
        <ClienteHeader cliente={cliente} />
  
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <ClienteTabs tab={tab} onChange={setTab} />
  
          {tab === "Información" && (
            <InformacionTab cliente={cliente} />
          )}
  
          {tab === "Conversaciones" && (
            <ConversacionesTab cliente={cliente} />
          )}
  
          {tab === "Seguimientos" && (
            <SeguimientosTab cliente={cliente} />
          )}
  
          {tab === "IA" && (
            <IATab cliente={cliente} />
          )}
        </div>
      </div>
    </div>
  );
}