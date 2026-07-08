import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ProfileModal from '@/components/ProfileModal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import abelovLogo from '@/assets/abelov-logo.png';
import {
  LayoutDashboard,
  FileText,
  Package,
  ShoppingCart,
  Truck,
  DollarSign,
  CreditCard,
  BarChart3,
  BookOpen,
  Menu,
  X,
  LogOut,
  User,
  Activity,
  Clock,
  TrendingUp,
  Wrench,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  section: 'main' | 'sales' | 'admin' | 'academy' | 'attendance' | 'technician' | 'technicians';
  roles?: string[];
}

const navItems: NavItem[] = [
  // Repairs Section
  { label: 'Repairs Dashboard', path: '/repairs-dashboard', icon: <LayoutDashboard size={20} />, section: 'repairs', roles: ['admin', 'secretary', 'academy'] },
  { label: 'Service Requests', path: '/requests', icon: <FileText size={20} />, section: 'repairs', roles: ['admin', 'secretary', 'academy'] },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} />, section: 'repairs', roles: ['admin', 'secretary'] },

  // Technicians Section
  { label: 'Jobs', path: '/requests', icon: <FileText size={20} />, section: 'technicians', roles: ['admin', 'technician'] },
  { label: 'Assigned Jobs', path: '/technician-dashboard', icon: <Wrench size={20} />, section: 'technicians', roles: ['admin', 'technician'] },
  { label: 'Technician Analytics', path: '/technician-analytics', icon: <TrendingUp size={20} />, section: 'technicians', roles: ['admin', 'technician'] },

  // Sales & Inventory Section
  { label: 'Sales Dashboard', path: '/sales-dashboard', icon: <LayoutDashboard size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  { label: 'Goods Inventory', path: '/goods', icon: <Package size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  { label: 'Purchases', path: '/purchases', icon: <ShoppingCart size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  { label: 'Orders', path: '/orders', icon: <Truck size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  { label: 'Expenses', path: '/expenses', icon: <DollarSign size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  { label: 'Credits', path: '/credits', icon: <CreditCard size={20} />, section: 'sales', roles: ['sales', 'admin'] },
  { label: 'Sales Analytics', path: '/sales-analytics', icon: <TrendingUp size={20} />, section: 'sales', roles: ['sales', 'admin'] },

  // Academy Section
  { label: 'Academy Dashboard', path: '/academy-dashboard', icon: <LayoutDashboard size={20} />, section: 'academy', roles: ['academy', 'admin'] },
  { label: 'Academy', path: '/academy', icon: <BookOpen size={20} />, section: 'academy', roles: ['academy', 'admin'] },
  { label: 'Academy Analytics', path: '/academy/analytics', icon: <BarChart3 size={20} />, section: 'academy', roles: ['academy', 'admin'] },

  // Attendance Section
  { label: 'Attendance Dashboard', path: '/attendance-dashboard', icon: <LayoutDashboard size={20} />, section: 'attendance', roles: ['secretary', 'admin'] },
  { label: 'Staff Attendance', path: '/attendance/manage', icon: <Clock size={20} />, section: 'attendance', roles: ['secretary', 'admin'] },
  { label: 'Attendance Analytics', path: '/attendance/reports', icon: <BarChart3 size={20} />, section: 'attendance', roles: ['secretary', 'admin'] },
  { label: 'Manage Technicians', path: '/manage-technicians', icon: <Wrench size={20} />, section: 'attendance', roles: ['secretary', 'admin'] },

  // Admin Section
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} />, section: 'admin', roles: ['admin'] },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} />, section: 'admin', roles: ['admin'] },
  { label: 'Ticket Management', path: '/admin/tickets', icon: <FileText size={20} />, section: 'admin', roles: ['admin'] },
  { label: 'User Management', path: '/admin/users', icon: <User size={20} />, section: 'admin', roles: ['admin'] },
  { label: 'Activity Log', path: '/admin/activity', icon: <Activity size={20} />, section: 'admin', roles: ['admin'] },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRoles, signOut } = useAuth();

  if (location.pathname === '/login') {
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
    return location.pathname === path;
  };

  const filterVisible = (section: string) =>
    navItems.filter((item) => item.section === section)
      .filter((item) => !item.roles || item.roles.some((r) => userRoles.includes(r)));

  const hasVisible = (section: string) => filterVisible(section).length > 0;

  const renderItems = (section: string) =>
    filterVisible(section).map((item) => (
      <button
        key={item.path}
        onClick={() => handleNavigation(item.path)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive(item.path)
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-accent'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </button>
    ));

  return (
    <>
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

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-background border-r border-border transition-transform duration-300 z-40 flex flex-col overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-border shrink-0 flex items-center gap-3">
          <img src={abelovLogo} alt="Abelov Logo" className="w-10 h-10 rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-primary">Abelov Record Management System</h1>
          </div>
        </div>

          {user && (
            <div className="px-6 py-4 border-b border-border shrink-0">
              <p className="text-sm font-medium">{user.name || user.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="flex gap-1 mt-1.5 flex-wrap items-center">
                {userRoles.map((role) => (
                  <span key={role} className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {role}
                  </span>
                ))}
                {(() => {
                  const dept = user.department ||
                    (userRoles.some(r => ['secretary', 'technician'].includes(r)) ? 'engineering' : '');
                  return dept ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {dept}
                    </span>
                  ) : null;
                })()}
              </div>
            </div>
          )}

        <nav className="flex-1 overflow-y-auto py-4 min-h-0 px-4">
          <Accordion type="multiple" defaultValue={[]} className="space-y-1">
            {hasVisible('repairs') && (
            <AccordionItem value="repairs" className="border-0">
              <AccordionTrigger className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline">
                Repairs
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pt-1">
                  {renderItems('repairs')}
                </div>
              </AccordionContent>
            </AccordionItem>
            )}

            {hasVisible('technicians') && (
            <AccordionItem value="technicians" className="border-0">
              <AccordionTrigger className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline">
                Technicians
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pt-1">
                  {renderItems('technicians')}
                </div>
              </AccordionContent>
            </AccordionItem>
            )}

            {hasVisible('attendance') && (
              <AccordionItem value="attendance" className="border-0">
                <AccordionTrigger className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline">
                  Attendance
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-1">
                    {renderItems('attendance')}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {hasVisible('academy') && (
              <AccordionItem value="academy" className="border-0">
                <AccordionTrigger className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline">
                  Academy
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-1">
                    {renderItems('academy')}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {hasVisible('sales') && (
              <AccordionItem value="sales" className="border-0">
                <AccordionTrigger className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline">
                  Sales & Inventory
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-1">
                    {renderItems('sales')}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {hasVisible('admin') && (
              <AccordionItem value="admin" className="border-0">
                <AccordionTrigger className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline">
                  Admin
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-1">
                    {renderItems('admin')}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </nav>

        <div className="p-4 border-t border-border space-y-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => setShowProfileModal(true)}
          >
            <User size={16} className="mr-2" />
            Profile
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

      <ProfileModal open={showProfileModal} onOpenChange={setShowProfileModal} />
    </>
  );
}
