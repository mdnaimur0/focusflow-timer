import { ListChecks, Settings, Timer } from 'lucide-react';
import type { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (m: AppMode) => void;
  onSettingsOpen: () => void;
}

export function Header({ mode, onModeChange, onSettingsOpen }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 h-14 border-b border-white/5 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(248,113,113,0.15)' }}
        >
          <Timer size={14} style={{ color: '#f87171' }} />
        </div>
        <span className="font-semibold text-white/90 tracking-tight text-sm">
          FocusFlow
        </span>
      </div>

      {/* Mode toggle */}
      <div
        className="flex items-center rounded-full p-1 gap-0.5"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        {(
          [
            { id: 'taskless' as const, label: 'Timer', Icon: Timer },
            { id: 'task' as const, label: 'Tasks', Icon: ListChecks },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: mode === id ? 'rgba(255,255,255,0.10)' : 'transparent',
              color: mode === id ? '#f1f5f9' : 'rgba(241,245,249,0.4)',
            }}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Settings button */}
      <button
        onClick={onSettingsOpen}
        className="p-2 rounded-lg transition-colors cursor-pointer"
        style={{ color: 'rgba(255,255,255,0.4)' }}
        onMouseEnter={e =>
          ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.9)')
        }
        onMouseLeave={e =>
          ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)')
        }
        title="Settings"
      >
        <Settings size={17} />
      </button>
    </header>
  );
}
