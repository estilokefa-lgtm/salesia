let schedulerActivo = false;
let intervaloScheduler = null;

export function iniciarScheduler({
  ejecutar,
  intervaloMs = 5 * 60 * 1000,
}) {
  if (schedulerActivo) {
    console.log(
      "Scheduler IA ya estaba iniciado"
    );
    return;
  }

  if (typeof ejecutar !== "function") {
    throw new Error(
      "El Scheduler necesita una función ejecutar"
    );
  }

  schedulerActivo = true;

  console.log(
    `Scheduler IA iniciado. Intervalo: ${
      intervaloMs / 1000
    } segundos`
  );

  async function ejecutarCiclo() {
    try {
      console.log(
        `[Scheduler IA] Inicio: ${new Date().toISOString()}`
      );

      await ejecutar();

      console.log(
        `[Scheduler IA] Fin: ${new Date().toISOString()}`
      );
    } catch (error) {
      console.error(
        "[Scheduler IA] Error:",
        error
      );
    }
  }

  ejecutarCiclo();

  intervaloScheduler = setInterval(
    ejecutarCiclo,
    intervaloMs
  );
}

export function detenerScheduler() {
  if (intervaloScheduler) {
    clearInterval(
      intervaloScheduler
    );
  }

  intervaloScheduler = null;
  schedulerActivo = false;

  console.log(
    "Scheduler IA detenido"
  );
}
