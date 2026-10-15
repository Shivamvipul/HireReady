import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ScanSearch, MessagesSquare, FileText, Linkedin, LogOut, Menu, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../store/authStore';
import { cn } from '../../utils/cn';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ats', label: 'ATS checker', icon: ScanSearch },
  { to: '/interview', label: 'Interview prep', icon: MessagesSquare },
  { to: '/resumes', label: 'Resume builder', icon: FileText },
  { to: '/linkedin', label: 'LinkedIn optimizer', icon: Linkedin },
];

export const Logo = ({ className }) => (
  <Link to="/" className={cn('flex items-center gap-2 font-display text-lg font-extrabold', className)}>
    <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent-strong text-white"><Sparkles className="h-4 w-4" aria-hidden /></span>
    HireRead<span className="text-accent">AI</span>
  </Link>
);

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const out = async () => { await logout(); toast.success('Signed out'); nav('/'); };
  const menuItems = [
    { label: 'Plans', action: () => setMenuOpen(false) },
    { label: 'Account', action: () => setMenuOpen(false) },
    { label: 'Help Center', action: () => setMenuOpen(false) },
    { label: 'Contact Us', action: () => setMenuOpen(false) },
    { label: 'Language', action: () => setMenuOpen(false), right: <span className="grid h-5 w-5 place-items-center rounded-full border border-line text-[10px] text-dim">◌</span> },
    { label: 'Log Out', action: out, danger: true },
  ];

  const links = (
    <nav aria-label="Main" className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={() => setOpen(false)}
          className={({ isActive }) => cn('flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-accent-soft text-accent shadow-[inset_0_0_0_1px_rgba(23,108,93,0.3)]' : 'text-dim hover:bg-raised hover:text-fg')}>
          <Icon className="h-4 w-4" aria-hidden />{label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink text-fg">
      <header className="no-print sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo />
          </div>

          <div className="hidden flex-1 justify-center lg:flex">{links}</div>

          <div className="relative flex items-center gap-3">
            <button className="hidden rounded-lg bg-accent-strong px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-accent-dark sm:inline-flex">Upgrade</button>
            <div className="relative">
              <button aria-label="Open user menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-full bg-accent-soft px-1.5 py-1.5 ring-1 ring-line transition hover:bg-raised">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-accent-strong text-[15px] font-semibold text-white">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1 h-4 w-4 text-dim" aria-hidden="true"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] w-[230px] overflow-hidden rounded-[12px] border border-[#dfe5e1] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
                  {menuItems.map(({ label, action, right, danger }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => { action?.(); setMenuOpen(false); }}
                      className={cn(
                        'flex w-full items-center justify-between px-4 py-3.5 text-left text-[15px] font-medium text-[#1d2a28] transition hover:bg-[#f5f8f6]',
                        label === 'Log Out' && 'border-t border-[#edf1ee]',
                        danger && 'font-semibold'
                      )}
                    >
                      <span>{label}</span>
                      {right || null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-line bg-surface lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-raised">{open ? <X /> : <Menu />}</button>
            <button className="rounded-lg bg-accent-strong px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark">Upgrade</button>
          </div>
          {open && (
            <div className="space-y-1 border-t border-line bg-surface p-3">
              {links}
              <button onClick={out} className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-dim"><LogOut className="h-4 w-4" aria-hidden />Sign out</button>
            </div>
          )}
        </div>
      </header>

      <main id="main" className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl"><Outlet /></div>
      </main>
    </div>
  );
}
