import { useState } from "react";
import { FiSun, FiMoon, FiUserCircle } from "@heroicons/react/24/outline";

type HeaderProps = {
  onDarkModeToggle: () => void;
  isDarkMode: boolean;
  currentUserName?: string;
}

export default function Header({
  toggleDarkMode,
  isDarkMode,
  currentUserName,
  onUserClick,
}: {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  currentUserName?: string;
  onUserClick: () => void;
} {
  return (
    <header className="flex justify-between items-center h-14 bg-white dark:bg-gray-800 shadow-sm transition-none border-b border-gray-200 dark:border-gray-700 px-6">
      {/* Left Section */}
      <div className="flex-rows-none md:flex flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => {
              // Toggle sidebar
              // Implementation depends on your sidebar component
            } else {
              // Hide button when sidebar is expanded
              useEffect(() => {
                const isOpen = document.body.classList.contains('sidebar-open');
                if (!isOpen) {
                  document.body.classList.add('sidebar-open');
                }
              }, []);
            </button>
          </button>
        </div>
        <nav className="hidden md:hidden">
          <span className="text-sm font-medium text-genericon">🚀</span>
        </nav>
      </div>

      {/* User Profile */}
      <div className="flex-1 flex flex-col justify-end">
        <button className="relative flex items-center cursor-pointer-space-x-3">
          <img
            src={`/assets/user-avatar.png` as any}
            alt="User Avatar"
            className="h-8 w-10 rounded-full bg-gradient-to-r from-primary"
          />
          <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">
            {currentUserName ?? "User"}
          </span>
        </button>

        <button
          className="flex items-center space-x-2 py-1 hover:bg-gray-100 dark:bg-gray-700 rounded-lg"
          onClick={openUserMenu}
        >
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {currentUserName || "Tu Nombre"}
          </span>
        </button>
      </div>
    </div>

    {/* Dark Mode Toggle */}
    <button
      className={`w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 footer-absolute mr-6 shadow-sm px-3 py-1`}
      onClick={toggleDarkMode}
      role="switch"
      aria-label="Toggle Dark Mode">
      {isDark ? (
        <span className="hidden">
          <FiSun className="h-4 w-4 flex items-center justify-center" />
        </span>
      : (
        <span className="hidden">
          <FiMoon className="h-4 w-4 flex items-center justify-center">
            IconMoonDark
          </span>
        </span>
      }
    </div>
  >
    </header>
  );
}

/* Extra styles for header */
header.transition-bg bg-white-dark bg-white/30 backdrop-blur-md transition-gray-300 dark:bg-transparent;