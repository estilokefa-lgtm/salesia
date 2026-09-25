import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import vendedorRouter from "./routes/vendedor.js";
import comercialRouter from "./routes/comercial.js";

import googlePlacesRouter from "./routes/googlePlaces.js";
import motorIARouter from "./routes/motorIA.js";
import { crearTareaIA } from "./services/tareasService.js";
import tareasRouter from "./routes/tareasRouter.js";
import vendedorRoutes from "./routes/vendedorRoutes.js";
import orquestadorRoutes from "./routes/orquestadorRoutes.js";
import {
  ejecutarOrquestador,
} from "./agents/orquestador/orquestadorAgent.js";
import {
  iniciarScheduler,
} from "./scheduler/scheduler.js";
import {completarTareaIA,} from "./services/tareasService.js";
import whatsappRouter from "./routes/whatsappRouter.js";


dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://salesia-hghwgleqg-danielk-s-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origen no permitido por CORS"));
      }
    },
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "SalesIA API funcionando",
  });
});

// =========================
// RUTAS
// =========================

app.use("/api", googlePlacesRouter);
app.use("/api", motorIARouter);
app.use("/api", vendedorRouter);
app.use("/api", comercialRouter);

app.use(
  "/api/tareas",
  tareasRouter
);

app.use(
  "/api/vendedor",
  vendedorRoutes
);
app.use(
  "/api/orquestador",
  orquestadorRoutes
);
app.use(
  "/api/whatsapp",
  whatsappRouter
);

// =========================
// RUTA DE PRUEBA DE TAREAS
// =========================

app.post(
  "/api/tareas/probar",
  async (_req, res) => {
    try {
      const tarea =
        await crearTareaIA({
          cliente_id: 6,
          agente: "Comercial",
          titulo:
            "Contactar a Corralón San Martín",
          descripcion:
            "Tarea de prueba creada automáticamente desde SalesIA.",
          prioridad: "Alta",
          accion: "Abrir cliente",
          ruta: "/clientes",
          payload: {
            canal: "WhatsApp",
            score: 95,
          },
        });

      res.json({
        ok: true,
        tarea,
      });
    } catch (error) {
      console.error(
        "Error probando tareas:",
        error
      );

      res.status(500).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido",
      });
    }
  }
);

// =========================
// INICIAR SERVIDOR
// =========================

const PORT =
  process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `🚀 SalesIA API corriendo en http://localhost:${PORT}`
  );

  iniciarScheduler({
    intervaloMs:
      5 * 60 * 1000,

    ejecutar: async () => {
      const resultado =
        await ejecutarOrquestador({
          limite: 100,
        });

      console.log(
        "[Scheduler IA] Resultado:",
        resultado.resumen
      );
    },
  });
});
