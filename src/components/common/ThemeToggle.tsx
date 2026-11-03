import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-base bg-surface text-on-surface transition-colors hover:bg-surface-container"
    >
      <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
    </button>
  );
}
