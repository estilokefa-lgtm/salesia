export async function buscarEmpresasGoogle({ rubro, ciudad, cantidad }) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
    if (!apiKey) {
      throw new Error("Falta GOOGLE_PLACES_API_KEY");
    }
  
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating",
        },
        body: JSON.stringify({
          textQuery: `${rubro} en ${ciudad}, Argentina`,
          maxResultCount: Math.min(Number(cantidad) || 10, 20),
          languageCode: "es",
          regionCode: "AR",
        }),
      }
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      console.error(data);
      throw new Error("Error buscando empresas en Google Places");
    }
  
    return (data.places || []).map((place) => ({
      nombre: "Sin contacto",
      empresa: place.displayName?.text || "Empresa sin nombre",
      telefono: place.nationalPhoneNumber || "",
      email: "",
      web: place.websiteUri || "",
      ciudad,
      pais: "Argentina",
      interes: rubro,
      origen: "Google Places",
      estado: "Nuevo",
      tipo_registro: "Lead",
      pipeline: "Nuevo",
      score: place.rating ? Math.round(place.rating * 20) : 70,
      observaciones: place.formattedAddress || "",
    }));
  }