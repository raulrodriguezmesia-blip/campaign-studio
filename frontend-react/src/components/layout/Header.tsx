import { useState, useEffect } from "react";
import { 
  SunIcon, 
  MoonIcon, 
  MagnifyingGlassIcon, 
  BellIcon
} from "@heroicons/react/24/outline";

type HeaderProps = {
  onDarkModeToggle: () => void;
  isDarkMode: boolean;
  currentUserName?: string;
  onUserClick?: () => void;
  toggleSidebar: () => void;
};

export default function Header({
  onDarkModeToggle,
  isDarkMode,
  currentUserName,
  onUserClick,
  toggleSidebar,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Handle clicks outside the user menu
  useEffect(() => {
    const handleClickOutside = (_event: MouseEvent) => {
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="flex justify-between items-center h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
      {/* Left Section */}
      <div className="flex-nowrap md:flex flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center space-x-3">
            <img src="/assets/logo.svg" alt="Campaign Studio" className="h-8 w-auto" />
            <span className="font-semibold text-xl text-primary dark:text-white">
              Campaign Studio
            </span>
          </div>
        </div>
        
        {/* Search Bar (hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar campañas, assets, usuarios..."
            className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 w-64"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          <BellIcon className="w-5 h-5" />
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center text-xs font-bold rounded-full bg-red-500 text-white">
            3
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onDarkModeToggle}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <img
              src="/assets/user-avatar.jpg"
              alt="User Avatar"
              className="h-8 w-8 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/avatars/placeholder.png';
              }}
            />
            <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">
              {currentUserName ?? "Usuario"}
            </span>
          </button>
          
          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="py-2">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  Perfil
                </div>
                <div className="px-4 py-2">
                  <button onClick={onUserClick} className="w-full text-left text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100">
                    Mi Perfil
                  </button>
                  <button onClick={() => {/* Logout logic */}} className="w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 block">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}