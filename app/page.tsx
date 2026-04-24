import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xl font-bold text-green-600">
            ⚽ TorneoPro
          </span>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center rounded-full bg-green-50 px-4 py-1.5 text-sm text-green-700 font-medium">
          Plataforma #1 para torneos amateur
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
          Gestiona tu torneo de fútbol{" "}
          <span className="text-green-600">sin complicaciones</span>
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-500 mb-10">
          Crea torneos, gestiona equipos, registra resultados y genera tablas de posiciones
          automáticamente. Todo en un solo lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-green-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
          >
            Comenzar gratis
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-300 px-8 py-3.5 text-base font-semibold text-gray-700 hover:border-green-600 hover:text-green-600 transition-colors"
          >
            Ver demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            Todo lo que necesitas
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} TorneoPro. Todos los derechos reservados.
      </footer>
    </main>
  );
}

const features = [
  {
    icon: "🏆",
    title: "Gestión de torneos",
    description: "Crea y administra torneos con fases de grupos, eliminatorias y más.",
  },
  {
    icon: "👥",
    title: "Equipos y jugadores",
    description: "Registra equipos, gestiona plantillas y controla jugadores.",
  },
  {
    icon: "📊",
    title: "Tablas en tiempo real",
    description: "Posiciones, estadísticas y resultados actualizados automáticamente.",
  },
  {
    icon: "📅",
    title: "Fixture automático",
    description: "Genera el calendario de partidos con un solo clic.",
  },
  {
    icon: "🔔",
    title: "Notificaciones",
    description: "Mantén a todos informados sobre partidos, resultados y cambios.",
  },
  {
    icon: "🔒",
    title: "Roles y permisos",
    description: "Control granular de acceso para admins, asistentes y capitanes.",
  },
];
