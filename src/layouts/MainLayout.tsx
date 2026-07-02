import { Outlet } from "react-router-dom";

import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";

export default function MainLayout() {
  return (
    <div
      className="
        flex
        min-h-screen
        w-full
      "
    >

      <Sidebar />


      <div
        className="
          flex
          flex-1
          flex-col
        "
      >

        <Header />


        <main
          className="
            flex-1
            bg-gray-50
            p-8
            overflow-auto
          "
        >

          <Outlet />

        </main>


      </div>


    </div>
  );
}