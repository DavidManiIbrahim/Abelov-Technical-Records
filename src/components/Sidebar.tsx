import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Package,
  ShoppingCart,
  Truck,
  DollarSign,
  CreditCard,
  BarChart3,
  Menu,
  X,
  LogOut,
  Settings,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  section: 'main' | 'sales' | 'admin';
  roles?: string[];
}

const navItems: NavItem[] = [
  // Main Section
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, section: 'main' },
  { label: 'Service Requests', path: '/requests', icon: <FileText size={20} />, section: 'main' },
  { label: 'New Request', path: '/new-request', icon: <FileText size={20} />, section: 'main' },
  
  // Sales & Inventory Section
  { label: 'Goods Inventory', path: '/goods', icon: <Package size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  { label: 'Purchases', path: '/purchases', icon: <ShoppingCart size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  { label: 'Orders', path: '/orders', icon: <Truck size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  { label: 'Expenses', path: '/expenses', icon: <DollarSign size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  { label: 'Credits', path: '/credits', icon: <CreditCard size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  
  // Analytics Section
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} />, section: 'main' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRoles, signOut } = useAuth();

  // Don't show sidebar on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/requests' && location.pathname.includes('/view')) return true;
    if (path === '/new-request' && (location.pathname === '/new-request' || location.pathname.includes('/edit'))) return true;
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-background border-r border-border transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">Abelov</h1>
          <p className="text-xs text-muted-foreground">Centralized System</p>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-4 border-b border-border">
            <p className="text-sm font-medium">{user.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Main Section */}
          <div className="px-4 mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Main</p>
            <div className="space-y-2">
              {navItems
                .filter((item) => item.section === 'main')
                .filter((item) => !item.roles || item.roles.some((r) => userRoles.includes(r)))
                .map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Sales & Inventory Section */}
          {navItems.some((item) => item.section === 'sales' && (!item.roles || item.roles.some((r) => userRoles.includes(r)))) && (
            <div className="px-4 mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sales & Inventory</p>
              <div className="space-y-2">
                {navItems
                  .filter((item) => item.section === 'sales')
                  .filter((item) => !item.roles || item.roles.some((r) => userRoles.includes(r)))
                  .map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => handleNavigation('/settings')}
          >
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
