import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xl font-bold text-green-700">⚽ TorneoPro</span>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 py-24 px-6 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-7xl">⚽</div>
          <div className="mb-4 inline-flex items-center rounded-full bg-green-500/30 px-4 py-1.5 text-sm font-medium text-green-100">
            Plataforma #1 para torneos de fútbol
          </div>
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
            Gestiona tu torneo{" "}
            <span className="text-green-300">sin complicaciones</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">
            Crea torneos, gestiona equipos, registra resultados y genera tablas
            de posiciones automáticamente. Desde el celular o el computador.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-green-800 shadow-lg hover:bg-green-50 transition-colors"
            >
              Comenzar gratis
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/50 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            Todo lo que necesitas para tu torneo
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-green-700 py-16 px-6 text-center">
        <h2 className="mb-3 text-3xl font-extrabold text-white">¿Listo para empezar?</h2>
        <p className="mb-8 text-green-200">
          Únete a los organizadores que confían en TorneoPro para gestionar sus torneos
        </p>
        <Link
          href="/register"
          className="inline-block rounded-xl bg-white px-8 py-3.5 text-base font-bold text-green-800 shadow-lg hover:bg-green-50 transition-colors"
        >
          Crear cuenta gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Link href="/login" className="hover:text-green-600 transition-colors">Iniciar sesión</Link>
          <span>·</span>
          <Link href="/register" className="hover:text-green-600 transition-colors">Registrarse</Link>
        </div>
        © {new Date().getFullYear()} TorneoPro. Todos los derechos reservados.
      </footer>
    </main>
  );
}

const features = [
  {
    icon: "🏆",
    title: "Gestión de torneos",
    description: "Crea y administra torneos en formato liga, eliminación directa o ida y vuelta.",
  },
  {
    icon: "👕",
    title: "Equipos y jugadores",
    description: "Registra equipos, gestiona plantillas y controla la información de cada jugador.",
  },
  {
    icon: "📊",
    title: "Tabla de posiciones",
    description: "Posiciones, estadísticas y resultados actualizados automáticamente tras cada partido.",
  },
  {
    icon: "📅",
    title: "Fixture automático",
    description: "Genera el calendario de partidos de forma automática según el formato del torneo.",
  },
  {
    icon: "🟨",
    title: "Sanciones y tarjetas",
    description: "Controla tarjetas amarillas, rojas y suspensiones en tiempo real.",
  },
  {
    icon: "🔒",
    title: "Roles y permisos",
    description: "Control de acceso para administradores, asistentes y capitanes de equipo.",
  },
];
