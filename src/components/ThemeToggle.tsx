import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'light') {
      return <Sun className="w-4 h-4" />;
    } else if (theme === 'dark') {
      return <Moon className="w-4 h-4" />;
    } else {
      return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
      title={`Current theme: ${theme || 'light'}`}
    >
      {getIcon()}
      <span className="hidden md:inline">
        {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : ''}
      </span>
    </Button>
  );
}
