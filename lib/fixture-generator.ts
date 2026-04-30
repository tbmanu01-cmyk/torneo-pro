import type { FormatoTorneo } from "@/types";

export type FixturePartido = {
  equipoLocalId:     string | null;
  equipoVisitanteId: string | null;
  hora:              string | null;
};

export type FixtureJornada = {
  numero:   number;
  nombre:   string;
  fecha:    Date | null;
  partidos: FixturePartido[];
};

type GenerateOptions = {
  fechaInicio:       Date;
  diasEntreJornadas: number;
  horaDefault:       string;
  shuffle:           boolean;
};

// ─── Round-Robin rotation algorithm ──────────────────────────────────────────

function roundRobinPairings(ids: string[]): Array<Array<[string, string]>> {
  const list = ids.length % 2 !== 0 ? [...ids, "BYE"] : [...ids];
  const n         = list.length;
  const halfSize  = n / 2;
  const rounds    = n - 1;
  const result: Array<Array<[string, string]>> = [];

  const circle = [...list];

  for (let round = 0; round < rounds; round++) {
    const pairs: Array<[string, string]> = [];
    for (let i = 0; i < halfSize; i++) {
      const home = circle[i];
      const away = circle[n - 1 - i];
      if (home !== "BYE" && away !== "BYE") {
        pairs.push([home, away]);
      }
    }
    result.push(pairs);

    // Rotate: keep circle[0] fixed, rotate circle[1..n-1] right by 1
    const last = circle[n - 1];
    for (let i = n - 1; i > 1; i--) circle[i] = circle[i - 1];
    circle[1] = last;
  }

  return result;
}

// ─── Elimination round names ──────────────────────────────────────────────────

function eliminationRoundName(gamesInRound: number): string {
  switch (gamesInRound) {
    case 1:  return "Final";
    case 2:  return "Semifinales";
    case 4:  return "Cuartos de Final";
    case 8:  return "Octavos de Final";
    case 16: return "Dieciseisavos de Final";
    default: return `Ronda de ${gamesInRound * 2}`;
  }
}

// ─── Public generators ────────────────────────────────────────────────────────

function buildDate(base: Date, offsetDays: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

export function generateLigaFixture(
  equipoIds: string[],
  opts: GenerateOptions,
): FixtureJornada[] {
  const ids      = opts.shuffle ? shuffle(equipoIds) : [...equipoIds];
  const rondas   = roundRobinPairings(ids);

  return rondas.map((pairs, i) => ({
    numero:   i + 1,
    nombre:   `Jornada ${i + 1}`,
    fecha:    buildDate(opts.fechaInicio, i * opts.diasEntreJornadas),
    partidos: pairs.map((p) => ({
      equipoLocalId:     p[0],
      equipoVisitanteId: p[1],
      hora:              opts.horaDefault,
    })),
  }));
}

export function generateIdaVueltaFixture(
  equipoIds: string[],
  opts: GenerateOptions,
): FixtureJornada[] {
  const ids       = opts.shuffle ? shuffle(equipoIds) : [...equipoIds];
  const rondas    = roundRobinPairings(ids);
  const totalVuelta = rondas.length;

  const ida: FixtureJornada[] = rondas.map((pairs, i) => ({
    numero:   i + 1,
    nombre:   `Jornada ${i + 1}`,
    fecha:    buildDate(opts.fechaInicio, i * opts.diasEntreJornadas),
    partidos: pairs.map((p) => ({
      equipoLocalId:     p[0],
      equipoVisitanteId: p[1],
      hora:              opts.horaDefault,
    })),
  }));

  const vuelta: FixtureJornada[] = rondas.map((pairs, i) => ({
    numero:   totalVuelta + i + 1,
    nombre:   `Jornada ${totalVuelta + i + 1} (Vuelta)`,
    fecha:    buildDate(opts.fechaInicio, (totalVuelta + i) * opts.diasEntreJornadas),
    partidos: pairs.map((p) => ({
      equipoLocalId:     p[1], // swap local/visitante
      equipoVisitanteId: p[0],
      hora:              opts.horaDefault,
    })),
  }));

  return [...ida, ...vuelta];
}

export function generateEliminacionFixture(
  equipoIds: string[],
  opts: GenerateOptions,
): FixtureJornada[] {
  const ids = opts.shuffle ? shuffle(equipoIds) : [...equipoIds];
  const n   = ids.length;

  // Pad to next power of 2
  let size = 1;
  while (size < n) size *= 2;
  const padded = [...ids, ...Array(size - n).fill(null)];

  // Build rounds from first (most games) to last (Final)
  const jornadas: FixtureJornada[] = [];
  let roundTeams = [...padded] as Array<string | null>;
  let roundNum   = 0;

  while (roundTeams.length >= 2) {
    const gamesInRound = roundTeams.length / 2;
    const partidos: FixturePartido[] = [];

    for (let i = 0; i < roundTeams.length; i += 2) {
      const local     = roundTeams[i];
      const visitante = roundTeams[i + 1];
      // Skip "null vs null" dummy byes but include "team vs null" bye slots as TBD
      if (local !== null || visitante !== null) {
        partidos.push({
          equipoLocalId:     local,
          equipoVisitanteId: visitante,
          hora:              opts.horaDefault,
        });
      }
    }

    if (partidos.length > 0) {
      jornadas.push({
        numero:   roundNum + 1,
        nombre:   eliminationRoundName(gamesInRound),
        fecha:    buildDate(opts.fechaInicio, roundNum * opts.diasEntreJornadas),
        partidos,
      });
    }

    // Next round is all TBD (winners TBD)
    const nextCount = roundTeams.length / 2;
    if (nextCount < 1) break;
    roundTeams = Array(nextCount).fill(null);
    roundNum++;
  }

  return jornadas;
}

// ─── Preview helper (client-safe, no DB) ─────────────────────────────────────

export function getFixturePreview(
  formato: FormatoTorneo,
  numEquipos: number,
): { jornadas: number; totalPartidos: number } | null {
  if (numEquipos < 2) return null;

  if (formato === "LIGA") {
    const n = numEquipos % 2 === 0 ? numEquipos : numEquipos + 1;
    return {
      jornadas:      n - 1,
      totalPartidos: (numEquipos * (numEquipos - 1)) / 2,
    };
  }

  if (formato === "IDA_VUELTA") {
    const n = numEquipos % 2 === 0 ? numEquipos : numEquipos + 1;
    return {
      jornadas:      (n - 1) * 2,
      totalPartidos: numEquipos * (numEquipos - 1),
    };
  }

  if (formato === "ELIMINACION_DIRECTA") {
    let size = 1;
    while (size < numEquipos) size *= 2;
    return {
      jornadas:      Math.log2(size),
      totalPartidos: numEquipos - 1,
    };
  }

  return null;
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
