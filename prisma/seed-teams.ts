/**
 * Seed de clubs, capitanes y jugadores ficticios para pruebas.
 * Uso: npx tsx prisma/seed-teams.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DATA: {
  capitan:   { name: string; email: string };
  club:      { nombre: string; ciudad: string };
  jugadores: { nombre: string; numeroJugador: number }[];
}[] = [
  {
    capitan:  { name: "Carlos Ríos",     email: "carlos.rios@torneo.test"     },
    club:     { nombre: "Atlético Medellín",    ciudad: "Medellín"    },
    jugadores: [
      { nombre: "Carlos Andrés Ríos",        numeroJugador: 1  },
      { nombre: "Sebastián Gómez Vargas",    numeroJugador: 2  },
      { nombre: "Mauricio Herrera León",     numeroJugador: 3  },
      { nombre: "Jhon Fredy Salcedo",        numeroJugador: 4  },
      { nombre: "Camilo Andrés Zapata",      numeroJugador: 5  },
      { nombre: "David Alejandro Cano",      numeroJugador: 6  },
      { nombre: "Yeison Murillo Patiño",     numeroJugador: 7  },
      { nombre: "Ferney Castillo Díaz",      numeroJugador: 8  },
      { nombre: "Luis Miguel Agudelo",       numeroJugador: 9  },
      { nombre: "Iván Darío Ospina",         numeroJugador: 10 },
      { nombre: "Cristian Tobón Arango",     numeroJugador: 11 },
      { nombre: "William Rueda Montoya",     numeroJugador: 12 },
    ],
  },
  {
    capitan:  { name: "Óscar Cabrera",   email: "oscar.cabrera@torneo.test"   },
    club:     { nombre: "Deportivo Cali FC",     ciudad: "Cali"        },
    jugadores: [
      { nombre: "Óscar Fabián Cabrera",      numeroJugador: 1  },
      { nombre: "Andrés Felipe Rojas",       numeroJugador: 3  },
      { nombre: "Miguel Ángel Perea",        numeroJugador: 4  },
      { nombre: "Nelson Eduardo Lozano",     numeroJugador: 5  },
      { nombre: "Jorge Luis Caicedo",        numeroJugador: 6  },
      { nombre: "Harold Mosquera Hurtado",   numeroJugador: 7  },
      { nombre: "Richard Sánchez Polo",      numeroJugador: 8  },
      { nombre: "Édgar Morales Quintero",    numeroJugador: 9  },
      { nombre: "Juan Pablo Angulo",         numeroJugador: 10 },
      { nombre: "Alexis Rentería Cuesta",    numeroJugador: 11 },
      { nombre: "Rodrigo Vélez Mina",        numeroJugador: 22 },
      { nombre: "Diego Fernando Borja",      numeroJugador: 17 },
    ],
  },
  {
    capitan:  { name: "Rodrigo Fuentes", email: "rodrigo.fuentes@torneo.test" },
    club:     { nombre: "Club América Latino",   ciudad: "Bogotá"      },
    jugadores: [
      { nombre: "Rodrigo Alejandro Fuentes", numeroJugador: 1  },
      { nombre: "Ernesto Villanueva Cruz",   numeroJugador: 2  },
      { nombre: "Héctor Manuel Delgado",     numeroJugador: 3  },
      { nombre: "Rafael Ignacio Torres",     numeroJugador: 4  },
      { nombre: "Marco Antonio Flores",      numeroJugador: 5  },
      { nombre: "César Augusto Medina",      numeroJugador: 6  },
      { nombre: "Javier Enrique Ramírez",    numeroJugador: 7  },
      { nombre: "Ricardo Hernández Vega",    numeroJugador: 8  },
      { nombre: "Arturo López Sandoval",     numeroJugador: 9  },
      { nombre: "Gabriel Moreno Ruiz",       numeroJugador: 10 },
      { nombre: "Simón Castro Padilla",      numeroJugador: 11 },
      { nombre: "Oswaldo Guerrero Mata",     numeroJugador: 13 },
    ],
  },
  {
    capitan:  { name: "Patricio Soto",   email: "patricio.soto@torneo.test"   },
    club:     { nombre: "FC Santiago del Norte", ciudad: "Santiago"    },
    jugadores: [
      { nombre: "Patricio Andrés Soto",      numeroJugador: 1  },
      { nombre: "Gonzalo Esteban Pizarro",   numeroJugador: 2  },
      { nombre: "Ignacio Fernández Reyes",   numeroJugador: 3  },
      { nombre: "Tomás Alejandro Bravo",     numeroJugador: 4  },
      { nombre: "Felipe Rodrigo Contreras",  numeroJugador: 5  },
      { nombre: "Bastián Nicolás Rojas",     numeroJugador: 6  },
      { nombre: "Matías Ignacio Vidal",      numeroJugador: 7  },
      { nombre: "Cristóbal Andrés Herrera",  numeroJugador: 8  },
      { nombre: "Diego Alexis Medel",        numeroJugador: 9  },
      { nombre: "Alexis Nicolás Valdivia",   numeroJugador: 10 },
      { nombre: "Eduardo Rodrigo Vargas",    numeroJugador: 11 },
      { nombre: "Mauricio Rodrigo Isla",     numeroJugador: 16 },
    ],
  },
  {
    capitan:  { name: "Brayan Cortés",   email: "brayan.cortes@torneo.test"   },
    club:     { nombre: "Unión Bogotá",          ciudad: "Bogotá"      },
    jugadores: [
      { nombre: "Brayan Stiven Cortés",       numeroJugador: 1  },
      { nombre: "Cristian Camilo Ávila",      numeroJugador: 2  },
      { nombre: "Henry Alejandro Mora",       numeroJugador: 3  },
      { nombre: "Giovanny Andrés Buitrago",   numeroJugador: 4  },
      { nombre: "Kelvin Stiven Osorio",       numeroJugador: 5  },
      { nombre: "Aldair Quintana Pinilla",    numeroJugador: 6  },
      { nombre: "Jader Elieser Palomino",     numeroJugador: 7  },
      { nombre: "Stiven Hurtado Moya",        numeroJugador: 8  },
      { nombre: "Kelvin Giovanni Lozano",     numeroJugador: 9  },
      { nombre: "Baldomero Perlaza Ibargüen", numeroJugador: 10 },
      { nombre: "Roger Iván Martínez",        numeroJugador: 11 },
      { nombre: "Macnelly Torres Berrio",     numeroJugador: 20 },
    ],
  },
  {
    capitan:  { name: "Rafael Romo",     email: "rafael.romo@torneo.test"     },
    club:     { nombre: "Real Caracas SC",       ciudad: "Caracas"     },
    jugadores: [
      { nombre: "Rafael Enrique Romo",         numeroJugador: 1  },
      { nombre: "Ronald Alberto Hernández",    numeroJugador: 2  },
      { nombre: "Rolf Alexei Feltscher",       numeroJugador: 3  },
      { nombre: "Jhon Chancellor Aray",        numeroJugador: 4  },
      { nombre: "Oswaldo Vizcarrondo Ibarra",  numeroJugador: 5  },
      { nombre: "Alexander Gonzalo Granko",    numeroJugador: 6  },
      { nombre: "Tomás Rincón Hernández",      numeroJugador: 7  },
      { nombre: "Yangel Herrera Mina",         numeroJugador: 8  },
      { nombre: "Darwin Machís Hernández",     numeroJugador: 9  },
      { nombre: "Juan Arango Sáenz",           numeroJugador: 10 },
      { nombre: "Salomón Rondón Giménez",      numeroJugador: 11 },
      { nombre: "Josef Martínez Zapata",       numeroJugador: 18 },
    ],
  },
  {
    capitan:  { name: "Pedro Gallese",   email: "pedro.gallese@torneo.test"   },
    club:     { nombre: "Sporting Lima",         ciudad: "Lima"        },
    jugadores: [
      { nombre: "Pedro Antonio Gallese",       numeroJugador: 1  },
      { nombre: "Luis Advíncula Caicedo",      numeroJugador: 2  },
      { nombre: "Miguel Araujo Tanaka",        numeroJugador: 3  },
      { nombre: "Carlos Zambrano Ochandarte",  numeroJugador: 4  },
      { nombre: "Aldo Alejandro Corzo",        numeroJugador: 5  },
      { nombre: "Renato Tapia Cortez",         numeroJugador: 6  },
      { nombre: "Christofer Gonzales Pizarro", numeroJugador: 7  },
      { nombre: "Yoshimar Yotún Flores",       numeroJugador: 8  },
      { nombre: "Gianluca Lapadula Vargas",    numeroJugador: 9  },
      { nombre: "Christian Cueva Bravo",       numeroJugador: 10 },
      { nombre: "André Carrillo Díaz",         numeroJugador: 11 },
      { nombre: "Alex Valera Cieza",           numeroJugador: 19 },
    ],
  },
  {
    capitan:  { name: "Agustín Rossi",   email: "agustin.rossi@torneo.test"   },
    club:     { nombre: "Boca del Sur",          ciudad: "Buenos Aires"},
    jugadores: [
      { nombre: "Agustín Fernando Rossi",      numeroJugador: 1  },
      { nombre: "Nicolás Fabián Figal",        numeroJugador: 2  },
      { nombre: "Carlos Emanuel Izquierdoz",   numeroJugador: 3  },
      { nombre: "Lisandro Javier Magallán",    numeroJugador: 4  },
      { nombre: "Frank Sebastián Fabra",       numeroJugador: 6  },
      { nombre: "Javier Alejandro Mascherano", numeroJugador: 5  },
      { nombre: "Julio Ángel Buffarini",       numeroJugador: 7  },
      { nombre: "Eduardo Salvio Laval",        numeroJugador: 8  },
      { nombre: "Ramón Ábila García",          numeroJugador: 9  },
      { nombre: "Carlos Tevez Martínez",       numeroJugador: 10 },
      { nombre: "Cristian Pavón Ocampo",       numeroJugador: 11 },
      { nombre: "Sebastián Battaglia Moreno",  numeroJugador: 14 },
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("capitan123", 10);

  const torneo =
    (await prisma.torneo.findFirst({ where: { formato: "LIGA" }, orderBy: { createdAt: "desc" } })) ??
    (await prisma.torneo.findFirst({ orderBy: { createdAt: "desc" } }));

  if (!torneo) {
    console.error("❌ No hay torneos. Crea uno primero desde la app.");
    process.exit(1);
  }

  console.log(`\n📋 Torneo destino: "${torneo.nombre}" (${torneo.formato})\n`);

  for (const item of DATA) {
    // 1. Crear/obtener usuario capitán
    let user = await prisma.user.findUnique({ where: { email: item.capitan.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: item.capitan.name, email: item.capitan.email, password: passwordHash, role: "CAPITAN" },
      });
      console.log(`  👤 Usuario creado: ${user.name} <${user.email}>`);
    } else {
      console.log(`  👤 Usuario existente: ${user.name} <${user.email}>`);
    }

    // 2. Crear/obtener club
    let club = await prisma.club.findFirst({ where: { nombre: item.club.nombre } });
    if (!club) {
      club = await prisma.club.create({
        data: { nombre: item.club.nombre, ciudad: item.club.ciudad, capitanId: user.id },
      });
      console.log(`  👕 Club creado: ${club.nombre} (${item.club.ciudad})`);
    } else {
      console.log(`  👕 Club existente: ${club.nombre}`);
    }

    // 3. Inscribir en torneo
    const yaInscrito = await prisma.equipo.findFirst({ where: { torneoId: torneo.id, clubId: club.id } });
    if (!yaInscrito) {
      await prisma.equipo.create({
        data: {
          nombre:    club.nombre,
          torneoId:  torneo.id,
          clubId:    club.id,
          capitanId: user.id,
          jugadores: { create: item.jugadores },
        },
      });
      console.log(`  ✅ Inscrito con ${item.jugadores.length} jugadores\n`);
    } else {
      console.log(`  ⏭  Ya inscrito\n`);
    }
  }

  console.log("🎉 Seed completado.\n");
  console.log("Contraseña de todos los capitanes: capitan123");
  DATA.forEach((d) => console.log(`  ${d.capitan.email}`));
  console.log();
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
