import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import DashboardPage from "../modules/dashboard/DashboardPage";
import ClientesPage from "../modules/clientes/ClientesPage";
import ProductosPage from "../modules/productos/ProductosPage";
import VentasPage from "../modules/ventas/VentasPage";
import ProspeccionPage from "../modules/prospeccion/ProspeccionPage";
import AgenteComercialPage from "../modules/agentes/AgenteComercialPage";
import AgentesPage from "../modules/agentes/AgentesPage";
import BandejaIAPage from "../modules/bandeja/BandejaIAPage";


export default function AppRouter() {

  return (

    <BrowserRouter>

      <Routes>


        <Route element={<MainLayout />}>


          <Route
            path="/"
            element={<DashboardPage />}
          />


          <Route
            path="/clientes"
            element={<ClientesPage />}
          />


          <Route
            path="/productos"
            element={<ProductosPage />}
          />


          <Route
            path="/ventas"
            element={<VentasPage />}
          />
          <Route path="/prospeccion" element={<ProspeccionPage />} />
          <Route
  path="/agentes/comercial"
  element={<AgenteComercialPage />}
/>
<Route
  path="/agentes"
  element={<AgentesPage />}
/>
<Route
  path="/bandeja"
  element={<BandejaIAPage />}
/>


        </Route>


      </Routes>


    </BrowserRouter>

  );
}