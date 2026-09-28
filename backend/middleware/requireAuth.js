import { supabase } from "../services/supabaseService.js";

export async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        ok: false,
        error: "Usuario no autenticado",
      });
    }

    const token = authorization.substring(7);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        ok: false,
        error: "Sesión inválida o vencida",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Error validando autenticación:",
      error
    );

    return res.status(401).json({
      ok: false,
      error: "No se pudo validar la sesión",
    });
  }
}
