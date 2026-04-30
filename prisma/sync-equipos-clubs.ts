/**
 * Sincroniza nombre y logo de cada equipo con su club vinculado.
 * Uso: npx tsx prisma/sync-equipos-clubs.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const equipos = await prisma.equipo.findMany({
    where:   { clubId: { not: null } },
    include: { club: true },
  });

  console.log(`\n🔄 Sincronizando ${equipos.length} equipo(s) con sus clubs...\n`);

  let updated = 0;
  for (const equipo of equipos) {
    if (!equipo.club) continue;

    const club = equipo.club;
    const needsUpdate =
      equipo.nombre !== club.nombre || equipo.logo !== club.logo;

    if (needsUpdate) {
      await prisma.equipo.update({
        where: { id: equipo.id },
        data:  { nombre: club.nombre, logo: club.logo },
      });
      console.log(`  ✅ "${equipo.nombre}" → "${club.nombre}"`);
      updated++;
    } else {
      console.log(`  ⏭  "${equipo.nombre}" ya está sincronizado`);
    }
  }

  console.log(`\n🎉 Listo. ${updated} equipo(s) actualizados.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
