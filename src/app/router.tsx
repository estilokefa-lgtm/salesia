import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import DashboardPage from "../modules/dashboard/DashboardPage";
import ClientesPage from "../modules/clientes/ClientesPage";
import ProductosPage from "../modules/productos/ProductosPage";
import VentasPage from "../modules/ventas/VentasPage";


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


        </Route>


      </Routes>


    </BrowserRouter>

  );
}