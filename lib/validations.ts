import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    name:            z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email:           z.string().email("Email inválido"),
    password:        z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const ROLES = ["SUPER_ADMIN", "ADMIN_TORNEO", "ASISTENTE", "CAPITAN", "ESPECTADOR"] as const;

export const createUserAdminSchema = z.object({
  name:     z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email:    z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role:     z.enum(ROLES, { errorMap: () => ({ message: "Rol inválido" }) }),
});

export const updateUserAdminSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  role: z.enum(ROLES, { errorMap: () => ({ message: "Rol inválido" }) }),
});

// ─── Torneos ──────────────────────────────────────────────────────────────────

const FORMATOS  = ["LIGA", "ELIMINACION_DIRECTA", "IDA_VUELTA"] as const;
const ESTADOS_T = ["PENDIENTE", "EN_CURSO", "FINALIZADO"] as const;
const ESTADOS_P = ["PENDIENTE", "PARCIAL", "PAGADO", "BLOQUEADO"] as const;

export const torneoSchema = z.object({
  nombre:         z.string().min(2, "Mínimo 2 caracteres"),
  descripcion:    z.string().optional(),
  logo:           z.string().optional(),
  formato:        z.enum(FORMATOS, { errorMap: () => ({ message: "Formato inválido" }) }),
  estado:         z.enum(ESTADOS_T).optional(),
  puntosVictoria: z.coerce.number().int().min(0).default(3),
  puntosEmpate:   z.coerce.number().int().min(0).default(1),
  puntosDerrota:  z.coerce.number().int().min(0).default(0),
  edicion:        z.coerce.number().int().min(1).default(1),
  fechaInicio:    z.string().optional(),
  fechaFin:       z.string().optional(),
});

// ─── Equipos ──────────────────────────────────────────────────────────────────

export const equipoSchema = z.object({
  nombre:     z.string().min(2, "Mínimo 2 caracteres"),
  logo:       z.string().optional(),
  capitanId:  z.string().optional(),
  estadoPago: z.enum(ESTADOS_P).optional(),
});

// ─── Jugadores ────────────────────────────────────────────────────────────────

export const jugadorSchema = z.object({
  nombre:            z.string().min(2, "Mínimo 2 caracteres"),
  numeroJugador:     z.coerce.number().int().min(1, "Mínimo 1").max(99, "Máximo 99"),
  goles:             z.coerce.number().int().min(0).default(0),
  asistencias:       z.coerce.number().int().min(0).default(0),
  tarjetasAmarillas: z.coerce.number().int().min(0).default(0),
  tarjetasRojas:     z.coerce.number().int().min(0).default(0),
  suspendido:        z.boolean().default(false),
});

// ─── Clubs ────────────────────────────────────────────────────────────────────

export const clubSchema = z.object({
  nombre:    z.string().min(2, "Mínimo 2 caracteres"),
  logo:      z.string().optional(),
  ciudad:    z.string().optional(),
  capitanId: z.string().optional(),
});

// ─── Pagos ────────────────────────────────────────────────────────────────────

const MONEDAS = ["VES", "USD", "COP", "EUR"] as const;

export const configuracionPagoSchema = z.object({
  montoInscripcion:        z.coerce.number().positive("Debe ser mayor a 0"),
  moneda:                  z.enum(MONEDAS).default("VES"),
  permiteCuotas:           z.boolean().default(false),
  numeroCuotas:            z.coerce.number().int().min(1).max(2).optional(),
  montoPrimeraCuota:       z.coerce.number().positive().optional(),
  montoSegundaCuota:       z.coerce.number().positive().optional(),
  fechaLimitePrimeraCuota: z.string().optional(),
  fechaLimiteSegundaCuota: z.string().optional(),
  banco:                   z.string().min(2, "Requerido"),
  telefono:                z.string().min(10, "Teléfono requerido"),
  cedula:                  z.string().min(4, "Cédula requerida"),
  titular:                 z.string().min(2, "Requerido"),
  instrucciones:           z.string().optional(),
});

export type ConfiguracionPagoInput = z.infer<typeof configuracionPagoSchema>;

// ─── Inferred types ───────────────────────────────────────────────────────────

export type ClubInput            = z.infer<typeof clubSchema>;
export type LoginInput           = z.infer<typeof loginSchema>;
export type RegisterInput        = z.infer<typeof registerSchema>;
export type CreateUserAdminInput = z.infer<typeof createUserAdminSchema>;
export type UpdateUserAdminInput = z.infer<typeof updateUserAdminSchema>;
export type TorneoInput          = z.infer<typeof torneoSchema>;
export type EquipoInput          = z.infer<typeof equipoSchema>;
export type JugadorInput         = z.infer<typeof jugadorSchema>;
