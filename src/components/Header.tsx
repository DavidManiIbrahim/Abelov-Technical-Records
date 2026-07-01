import { useAuth } from '@/contexts/AuthContext';
import abelovLogo from '@/assets/abelov-logo.png';

interface HeaderProps {
  title: string;
  showEmail?: boolean;
  children?: React.ReactNode;
}

export default function Header({ title, showEmail, children }: HeaderProps) {
  const { user } = useAuth();

  return (
    <div className="border-b bg-card p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={abelovLogo} alt="Abelov Logo" className="w-12 rounded-3xl h-12" />
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-primary dark:text-black">{title}</h1>
            {showEmail && user?.email && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{user.email}</p>
            )}
          </div>
        </div>
        {children && <div className="flex gap-2 items-center">{children}</div>}
      </div>
    </div>
  );
}
