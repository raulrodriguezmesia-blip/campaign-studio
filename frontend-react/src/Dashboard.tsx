import { useState, useEffect } from "react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import MetricCard from "./components/uic/MetricCard";
import { 
  PhotoIcon, 
  ExclamationTriangleIcon, 
  SunIcon, 
  MoonIcon,
  BellIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { HomeIcon, ChartBarIcon } from "@heroicons/react/24/solid";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const [isDark, setIsDark] = useState(false);

  // Load dark mode from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  // Sample data - replace with real data from your API
  const campaignActivity = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [
      {
        label: "Campañas",
        data: [12, 15, 18, 10, 16, 14, 17],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.3)",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const imageDistribution = {
    labels: ["Social", "Web", "Email", "Display"],
    datasets: [
      {
        data: [35, 30, 25, 10],
        backgroundColor: ["#2563eb", "#10b981", "#7e22ce", "#f59e0b"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md shadow-xl border-r border-gray-200 dark:border-gray-700">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center px-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Campaign Studio
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            <a href="#" className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary dark:bg-primary/20 transition-all duration-200">
              <HomeIcon className="h-5 w-5" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200">
              <ChartBarIcon className="h-5 w-5" />
              Analytics
            </a>
            <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200">
              <PhotoIcon className="h-5 w-5" />
              Campaigns
            </a>
            <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Errors
            </a>
          </nav>

          {/* Dark Mode Toggle */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              onClick={toggleDark}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {isDark ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard de Campañas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monitorea el rendimiento de tus campañas en tiempo real</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar campañas..."
                className="w-64 rounded-xl border border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 backdrop-blur-md dark:bg-gray-800/50">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  3
                </span>
              </button>
            </div>

            <button className="flex items-center gap-2 rounded-xl bg-white/50 px-4 py-2 backdrop-blur-md dark:bg-gray-800/50">
              <img
                src="/assets/user-avatar.jpg"
                alt="User Avatar"
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><text y=".9em" font-size="40">👤</text></svg>';
                }}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Usuario</span>
            </button>
          </div>
        </header>

        {/* Metric Cards Grid */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon="🚀"
            title="Campañas Activas"
            value="12"
            color="primary"
            change="+2.4% esta semana"
            trend="up"
          />
          <MetricCard
            icon="🖼️"
            title="Imágenes Generadas"
            value="245"
            color="secondary"
            change="+12.3% este mes"
            trend="up"
          />
          <MetricCard
            icon="⚡"
            title="Errores Detectados"
            value="3"
            color="danger"
            change="-1 errores críticos"
            trend="down"
          />
          <MetricCard
            icon="💰"
            title="Uso de Créditos"
            value="70%"
            color="purple"
            change="40 créditos restantes"
            progress={70}
          />
        </div>

        {/* Charts Grid */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white/40 p-6 shadow-md backdrop-blur-md dark:bg-gray-800/40">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Actividad de Campañas</h3>
            <div className="h-64">
              <Line
                data={campaignActivity}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white/40 p-6 shadow-md backdrop-blur-md dark:bg-gray-800/40">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Distribución de Imágenes</h3>
            <div className="h-64">
              <Bar
                data={imageDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl bg-white/40 p-6 shadow-md backdrop-blur-md dark:bg-gray-800/40">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 border-l-2 border-primary pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                🚀
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Nueva campaña creada: "Verano 2026"</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hace 5 minutos</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-l-2 border-secondary pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                🖼️
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">3 imágenes generadas para el landing page</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hace 10 minutos</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-l-2 border-yellow-500 pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                ⚠️
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Error de API detectado, usando modo simulador</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hace 15 minutos</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}