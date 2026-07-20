import {
    ejecutarAgenteComercial,
  } from "../comercial/comercialAgent.js";
  
  import {
    ejecutarFlujoVendedor,
  } from "../vendedor/vendedorWorkflow.js";
  
  import {
    obtenerClientesParaAnalisis,
  } from "../../services/clientesService.js";
  
  import {
    obtenerMemoriaCliente,
  } from "../../services/memoriaIAService.js";
  
  
  async function obtenerMemoriasClientes(
    clientes
  ) {
    const memorias = [];
  
    for (const cliente of clientes) {
      if (!cliente?.id) {
        continue;
      }
  
      try {
        const historial =
          await obtenerMemoriaCliente(
            cliente.id
          );
  
        memorias.push({
          cliente_id:
            cliente.id,
  
          historial:
            historial ?? [],
        });
      } catch (error) {
        console.error(
          `No se pudo recuperar la memoria del cliente ${cliente.id}:`,
          error
        );
  
        memorias.push({
          cliente_id:
            cliente.id,
  
          historial: [],
        });
      }
    }
  
    return memorias;
  }
  
  
  function esOportunidadPrioritaria(
    oportunidad
  ) {
    const prioridad =
      oportunidad?.prioridad
        ?.toString()
        .trim()
        .toLowerCase();
  
    return (
      prioridad === "alta" ||
      prioridad === "media"
    );
  }
  
  
  export async function ejecutarOrquestador({
    limite = 100,
    limiteVendedor = 10,
  } = {}) {
    const inicio = Date.now();
  
    console.log(
      "========== ORQUESTADOR SALESIA =========="
    );
  
    console.log(
      "Iniciando análisis de cartera..."
    );
  
    const clientes =
      await obtenerClientesParaAnalisis({
        limite,
      });
  
    if (clientes.length === 0) {
      return {
        ok: true,
  
        resumen: {
          clientes_recuperados: 0,
          clientes_analizados: 0,
  
          tareas_creadas: 0,
          tareas_comercial_creadas: 0,
          tareas_vendedor_creadas: 0,
  
          oportunidades_altas: 0,
          oportunidades_medias: 0,
          oportunidades_bajas: 0,
  
          vendedores_ejecutados: 0,
          tareas_vendedor_existentes: 0,
          vendedor_sin_tarea: 0,
          errores_vendedor: 0,
  
          duracion_ms:
            Date.now() - inicio,
        },
  
        agentes: {
          comercial: null,
          vendedor: [],
        },
      };
    }
  
    console.log(
      `Clientes recuperados: ${clientes.length}`
    );
  
    const memorias =
      await obtenerMemoriasClientes(
        clientes
      );
  
    console.log(
      `Memorias recuperadas: ${memorias.length}`
    );
  
  
    // ============================
    // AGENTE COMERCIAL
    // ============================
  
    console.log(
      "Ejecutando Agente Comercial..."
    );
  
    const resultadoComercial =
      await ejecutarAgenteComercial({
        clientes,
        memorias,
      });
  
  
    // ============================
    // AGENTE VENDEDOR
    // ============================
  
    const oportunidades =
      resultadoComercial
        ?.oportunidades ?? [];
  
        const oportunidadesPrioritarias =
        oportunidades
          .filter((oportunidad) => {
      
            if (!esOportunidadPrioritaria(oportunidad)) {
              return false;
            }
      
            return Number(oportunidad.score || 0) >= 70;
      
          })
          .sort(
            (a, b) =>
              Number(b.score || 0) -
              Number(a.score || 0)
          )
          .slice(0, limiteVendedor);
  
    console.log(
      `Oportunidades para Vendedor IA: ${oportunidadesPrioritarias.length}`
    );
  
    const resultadosVendedor = [];
  
    let tareasVendedorCreadas = 0;
    let tareasVendedorExistentes = 0;
    let vendedorSinTarea = 0;
    let erroresVendedor = 0;
  
    for (
      const oportunidad
      of oportunidadesPrioritarias
    ) {
      const cliente =
        clientes.find(
          (item) =>
            Number(item.id) ===
            Number(
              oportunidad.cliente_id
            )
        );
  
      if (!cliente) {
        console.error(
          `No se encontró el cliente ${oportunidad.cliente_id}`
        );
  
        erroresVendedor += 1;
  
        resultadosVendedor.push({
          cliente_id:
            oportunidad.cliente_id,
  
          ok: false,
  
          error:
            "No se encontró el cliente",
        });
  
        continue;
      }
  
      const memoria =
        memorias.find(
          (item) =>
            Number(item.cliente_id) ===
            Number(cliente.id)
        );
  
      const objetivo =
        oportunidad
          .accion_recomendada ||
        oportunidad.motivo ||
        "Contactar al cliente y avanzar con la oportunidad comercial.";
  
      const canal =
        oportunidad
          .canal_recomendado ||
        "WhatsApp";
  
      try {
        console.log(
          `Ejecutando Vendedor IA para cliente ${cliente.id}...`
        );
  
        const resultadoVendedor =
          await ejecutarFlujoVendedor({
            cliente,
            objetivo,
            canal,
  
            historialInicial:
              memoria?.historial ?? [],
          });
  
        resultadosVendedor.push({
          cliente_id:
            cliente.id,
  
          cliente:
            cliente.empresa ||
            cliente.nombre ||
            "Cliente",
  
          ...resultadoVendedor,
        });
  
        if (
          resultadoVendedor
            .tarea_creada
        ) {
          tareasVendedorCreadas += 1;
        } else if (
          resultadoVendedor
            .tarea_existente
        ) {
          tareasVendedorExistentes += 1;
        } else {
          vendedorSinTarea += 1;
        }
      } catch (error) {
        erroresVendedor += 1;
  
        console.error(
          `Error ejecutando Vendedor IA para cliente ${cliente.id}:`,
          error
        );
  
        resultadosVendedor.push({
          cliente_id:
            cliente.id,
  
          cliente:
            cliente.empresa ||
            cliente.nombre ||
            "Cliente",
  
          ok: false,
  
          error:
            error.message ||
            "No se pudo ejecutar el Vendedor IA",
        });
      }
    }
  
  
    // ============================
    // RESUMEN
    // ============================
  
    const tareasComercialCreadas =
      resultadoComercial
        ?.tareas_creadas ?? 0;
  
    const totalTareasCreadas =
      tareasComercialCreadas +
      tareasVendedorCreadas;
  
    const duracion =
      Date.now() - inicio;
  
    console.log(
      `Tareas Comercial creadas: ${tareasComercialCreadas}`
    );
  
    console.log(
      `Tareas Vendedor creadas: ${tareasVendedorCreadas}`
    );
  
    console.log(
      `Tareas Vendedor existentes: ${tareasVendedorExistentes}`
    );
  
    console.log(
      `Vendedores IA ejecutados: ${resultadosVendedor.length}`
    );
  
    console.log(
      `Duración total: ${duracion} ms`
    );
  
    console.log(
      "=========================================="
    );
  
    return {
      ok: true,
  
      resumen: {
        clientes_recuperados:
          clientes.length,
  
        clientes_analizados:
          resultadoComercial
            .resumen
            ?.clientes_analizados ??
          clientes.length,
  
        tareas_creadas:
          totalTareasCreadas,
  
        tareas_comercial_creadas:
          tareasComercialCreadas,
  
        tareas_vendedor_creadas:
          tareasVendedorCreadas,
  
        tareas_vendedor_existentes:
          tareasVendedorExistentes,
  
        oportunidades_altas:
          resultadoComercial
            .resumen
            ?.oportunidades_altas ?? 0,
  
        oportunidades_medias:
          resultadoComercial
            .resumen
            ?.oportunidades_medias ?? 0,
  
        oportunidades_bajas:
          resultadoComercial
            .resumen
            ?.oportunidades_bajas ?? 0,
  
        vendedores_ejecutados:
          resultadosVendedor.length,
  
        vendedor_sin_tarea:
          vendedorSinTarea,
  
        errores_vendedor:
          erroresVendedor,
  
        duracion_ms:
          duracion,
      },
  
      agentes: {
        comercial:
          resultadoComercial,
  
        vendedor:
          resultadosVendedor,
      },
    };
  }