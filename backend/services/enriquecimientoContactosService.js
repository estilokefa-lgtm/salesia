function normalizarUrl(url) {
    if (!url) return "";
  
    const limpia = url.trim();
  
    if (
      limpia.startsWith("http://") ||
      limpia.startsWith("https://")
    ) {
      return limpia;
    }
  
    return `https://${limpia}`;
  }
  
  function limpiarTexto(texto = "") {
    return texto
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  function esEmailNoComercial(email) {
    const bloqueados = [
      "noreply",
      "no-reply",
      "support@",
      "soporte@",
      "career",
      "careers",
      "empleos@",
      "jobs@",
      "rrhh",
      "humanresources",
      "recruitment",
      "reclutamiento",
      "survey",
      "surveys",
      "encuestas@",
      "onderzoek",
      "enquete",
      "sondage",
      "ankiet",
      "umfrage",
      "dpo@",
    ];
  
    return bloqueados.some((texto) =>
      email.toLowerCase().includes(texto)
    );
  }
  
  function puntuarEmail(email) {
    const valor = email.toLowerCase();
  
    let score = 0;
  
    const prioritarios = [
      "argentina",
      "ventas",
      "venta",
      "comercial",
      "sales",
      "contacto",
      "contact",
      "info@",
      "informacion",
      "marketing",
      "comunicacion",
      "comunicaciones",
    ];
  
    for (const palabra of prioritarios) {
      if (valor.includes(palabra)) {
        score += 10;
      }
    }
  
    if (valor.endsWith(".com.ar")) {
      score += 8;
    }
  
    if (valor.includes("@ipsos.com")) {
      score += 2;
    }
  
    return score;
  }
  
  function extraerEmails(html) {
    const emails = [];
  
    const regexEmail =
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  
    const encontrados =
      html.match(regexEmail) || [];
  
    emails.push(...encontrados);
  
    const regexMailto =
      /mailto:([^"'? <]+)/gi;
  
    let coincidencia;
  
    while (
      (coincidencia =
        regexMailto.exec(html)) !== null
    ) {
      if (coincidencia[1]) {
        emails.push(coincidencia[1]);
      }
    }
  
    const ignorados = [
      "example.com",
      "sentry.io",
      "wixpress.com",
      "wordpress.com",
      "zendesk.com",
    ];
  
    return [
      ...new Set(
        emails
          .map((email) =>
            email
              .replace(/^mailto:/i, "")
              .toLowerCase()
              .trim()
          )
          .filter(
            (email) =>
              email.includes("@") &&
              !ignorados.some((dominio) =>
                email.includes(dominio)
              ) &&
              !esEmailNoComercial(email)
          )
      ),
    ];
  }
  
  function seleccionarEmails(emails) {
    return [...emails]
      .sort(
        (a, b) =>
          puntuarEmail(b) -
          puntuarEmail(a)
      )
      .slice(0, 5);
  }
  
  function extraerTelefonos(html) {
    const telefonos = [];
  
    const regexTel =
      /tel:([^"' <]+)/gi;
  
    let coincidencia;
  
    while (
      (coincidencia =
        regexTel.exec(html)) !== null
    ) {
      if (coincidencia[1]) {
        telefonos.push(coincidencia[1]);
      }
    }
  
    const texto = html
      .replace(
        /<script[\s\S]*?<\/script>/gi,
        " "
      )
      .replace(
        /<style[\s\S]*?<\/style>/gi,
        " "
      )
      .replace(/<[^>]+>/g, " ");
  
    const regex =
      /(?:\+54[\s.-]?)?(?:9[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/g;
  
    telefonos.push(
      ...(texto.match(regex) || [])
    );
  
    return [
      ...new Set(
        telefonos
          .map((telefono) =>
            telefono
              .replace(/[^\d+]/g, "")
              .trim()
          )
          .filter((telefono) => {
            const numeros =
              telefono.replace(/\D/g, "");
  
            return (
              numeros.length >= 10 &&
              numeros.length <= 13
            );
          })
      ),
    ].slice(0, 5);
  }
  
  function extraerWhatsApp(html) {
    const regex =
      /https?:\/\/(?:wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)[^"' <]+/gi;
  
    const encontrados =
      html.match(regex) || [];
  
    return [
      ...new Set(
        encontrados.map((url) =>
          limpiarTexto(url)
        )
      ),
    ].slice(0, 3);
  }
  
  function esLinkCompartir(url) {
    const bloqueados = [
      "sharer.php",
      "sharearticle",
      "/share?",
      "intent/",
    ];
  
    const valor = url.toLowerCase();
  
    return bloqueados.some((texto) =>
      valor.includes(texto)
    );
  }
  
  function extraerRedes(html) {
    const redes = {
      instagram: [],
      facebook: [],
      linkedin: [],
    };
  
    const links =
      html.match(/https?:\/\/[^"' <]+/gi) ||
      [];
  
    for (const link of links) {
      const limpio = limpiarTexto(link);
  
      if (esLinkCompartir(limpio)) {
        continue;
      }
  
      if (
        limpio.includes("instagram.com") &&
        !redes.instagram.includes(limpio)
      ) {
        redes.instagram.push(limpio);
      }
  
      if (
        limpio.includes("facebook.com") &&
        !redes.facebook.includes(limpio)
      ) {
        redes.facebook.push(limpio);
      }
  
      if (
        limpio.includes("linkedin.com/company") &&
        !redes.linkedin.includes(limpio)
      ) {
        redes.linkedin.push(limpio);
      }
    }
  
    redes.instagram =
      redes.instagram.slice(0, 3);
  
    redes.facebook =
      redes.facebook.slice(0, 3);
  
    redes.linkedin =
      redes.linkedin.slice(0, 3);
  
    return redes;
  }
  
  function extraerLinksInternos(
    html,
    urlBase
  ) {
    const links = [];
  
    const regexHref =
      /href=["']([^"'#]+)["']/gi;
  
    let coincidencia;
  
    while (
      (coincidencia =
        regexHref.exec(html)) !== null
    ) {
      try {
        const href = coincidencia[1];
  
        if (
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("javascript:")
        ) {
          continue;
        }
  
        const url =
          new URL(href, urlBase);
  
        const pathname =
          url.pathname.toLowerCase();
  
        const palabrasPermitidas = [
          "contacto",
          "contact",
          "contact-us",
          "contactenos",
          "contato",
          "empresa",
          "nosotros",
          "about",
          "about-us",
        ];
  
        const segmentos = pathname
        .split("/")
        .filter(Boolean)
        .map((segmento) =>
          segmento.toLowerCase()
        );
      
      const esPaginaUtil =
        palabrasPermitidas.some(
          (palabra) =>
            segmentos.includes(palabra)
        );  
  
        const mismaWeb =
          url.origin ===
          new URL(urlBase).origin;
  
        if (
          esPaginaUtil &&
          mismaWeb
        ) {
          links.push(url.toString());
        }
      } catch {
        // Ignorar enlaces inválidos
      }
    }
  
    return [...new Set(links)];
  }
  
  async function descargarPagina(url) {
    const controller =
      new AbortController();
  
    const timeout =
      setTimeout(() => {
        controller.abort();
      }, 8000);
  
    try {
      const respuesta =
        await fetch(url, {
          signal:
            controller.signal,
  
          headers: {
            "User-Agent":
              "Mozilla/5.0 SalesIA Contact Enrichment",
  
            Accept:
              "text/html",
          },
        });
  
      if (!respuesta.ok) {
        throw new Error(
          `La página respondió con estado ${respuesta.status}`
        );
      }
  
      return await respuesta.text();
    } finally {
      clearTimeout(timeout);
    }
  }
  
  function combinarRedes(
    destino,
    origen
  ) {
    for (const tipo of [
      "instagram",
      "facebook",
      "linkedin",
    ]) {
      destino[tipo] = [
        ...new Set([
          ...(destino[tipo] || []),
          ...(origen[tipo] || []),
        ]),
      ].slice(0, 3);
    }
  
    return destino;
  }
  
  export async function enriquecerContacto(
    web
  ) {
    if (!web) {
      throw new Error(
        "La empresa no tiene una página web disponible"
      );
    }
  
    const urlPrincipal =
      normalizarUrl(web);
  
    try {
      const htmlPrincipal =
        await descargarPagina(
          urlPrincipal
        );
  
      const paginasAnalizadas = [
        urlPrincipal,
      ];
  
      let emails =
        extraerEmails(
          htmlPrincipal
        );
  
      let telefonos =
        extraerTelefonos(
          htmlPrincipal
        );
  
      let whatsapp =
        extraerWhatsApp(
          htmlPrincipal
        );
  
      let redes =
        extraerRedes(
          htmlPrincipal
        );
  
      const linksInternos =
        extraerLinksInternos(
          htmlPrincipal,
          urlPrincipal
        );
  
      const paginasExtra =
        linksInternos.slice(0, 3);
  
      for (
        const pagina
        of paginasExtra
      ) {
        try {
          const html =
            await descargarPagina(
              pagina
            );
  
          paginasAnalizadas.push(
            pagina
          );
  
          emails = [
            ...new Set([
              ...emails,
              ...extraerEmails(html),
            ]),
          ];
  
          telefonos = [
            ...new Set([
              ...telefonos,
              ...extraerTelefonos(html),
            ]),
          ].slice(0, 5);
  
          whatsapp = [
            ...new Set([
              ...whatsapp,
              ...extraerWhatsApp(html),
            ]),
          ].slice(0, 3);
  
          redes =
            combinarRedes(
              redes,
              extraerRedes(html)
            );
        } catch (error) {
          console.log(
            `No se pudo analizar ${pagina}:`,
            error.message
          );
        }
      }
  
      const emailsSeleccionados =
        seleccionarEmails(
          emails
        );
  
      return {
        web:
          urlPrincipal,
  
        email:
          emailsSeleccionados[0] ||
          "",
  
        emails:
          emailsSeleccionados,
  
        telefono:
          telefonos[0] || "",
  
        telefonos,
  
        whatsapp:
          whatsapp[0] || "",
  
        whatsapp_encontrados:
          whatsapp,
  
        redes,
  
        paginas_analizadas:
          paginasAnalizadas,
  
        enriquecido: true,
      };
    } catch (error) {
      if (
        error.name ===
        "AbortError"
      ) {
        throw new Error(
          "La página tardó demasiado en responder"
        );
      }
  
      throw new Error(
        `No se pudo analizar la página: ${error.message}`
      );
    }
  }