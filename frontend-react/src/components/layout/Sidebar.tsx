import { Link, useLocation } from "react-router-dom";
import { HomeIcon, ChartBarIcon, PhotoIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  { name: "Campaigns", href: "/campaigns", icon: PhotoIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md shadow-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center px-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Campaign Studio
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-error hover:bg-error/10 transition-all duration-200">
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}