import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Code2, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { APP_TITLE } from "@/const";

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();

  const navItems = [
    { label: "لوحة التحكم", href: "/dashboard" },
    { label: "القواعس", href: "/rules" },
    { label: "السجلات", href: "/logs" },
  ];

  const isActive = (href: string) => location === href;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">{APP_TITLE}</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={isActive(item.href) ? "default" : "ghost"}
                onClick={() => navigate(item.href)}
                className={isActive(item.href) ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 hidden sm:inline">{user?.name}</span>
            <Button
              onClick={() => {
                logout();
                navigate("/");
              }}
              variant="outline"
              size="sm"
            >
              تسجيل الخروج
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={isActive(item.href) ? "default" : "ghost"}
                onClick={() => {
                  navigate(item.href);
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
