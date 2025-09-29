import { NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, BarChart3, User as UserIcon, LogOut, Menu, X, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeToggle } from '../ThemeToggle';
import { User } from '@shared/types';
const navItems = [
  { href: '/', label: 'Events', icon: CalendarDays },
  { href: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];
const adminNavItems = [
    { href: '/admin', label: 'Admin', icon: Shield, roles: ['ADMIN', 'COACH'] },
];
export function AppLayout() {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const availableAdminNavs = adminNavItems.filter(item => user?.role && item.roles.includes(user.role));
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-foreground">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <CalendarDays className="h-6 w-6 text-primary" />
            <span>PitchPal</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="" />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </header>
        <main className="p-4 sm:p-6 pb-20">
          <Outlet />
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background shadow-t-lg">
          <div className={cn("grid h-16", availableAdminNavs.length > 0 ? "grid-cols-4" : "grid-cols-3")}>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            {availableAdminNavs.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <AnimatePresence>
          {isMobileMenuOpen && <MobileMenu user={user} logout={logout} closeMenu={() => setIsMobileMenuOpen(false)} />}
        </AnimatePresence>
      </div>
    );
  }
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <CalendarDays className="h-6 w-6 text-primary" />
              <span>PitchPal</span>
            </div>
          </div>
          <nav className="flex-1 px-2 py-4 lg:px-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        isActive && 'bg-primary/10 text-primary'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
              {availableAdminNavs.length > 0 && <hr className="my-2" />}
              {availableAdminNavs.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        isActive && 'bg-primary/10 text-primary'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-end gap-4 border-b bg-muted/40 px-4 lg:px-6">
          <ThemeToggle className="" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`} alt={user?.name} />
                  <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => (window.location.href = '/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-gray-50 dark:bg-gray-950">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
function MobileMenu({ user, logout, closeMenu }: { user: User | null; logout: () => void; closeMenu: () => void }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const availableAdminNavs = adminNavItems.filter(item => user?.role && item.roles.includes(user.role));
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 bg-background p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-lg font-semibold">
          <CalendarDays className="h-6 w-6 text-primary" />
          <span>PitchPal</span>
        </div>
        <Button variant="ghost" size="icon" onClick={closeMenu}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="mt-8 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`} alt={user?.name} />
          <AvatarFallback className="text-2xl">{user ? getInitials(user.name) : 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-lg">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>
      <nav className="mt-8">
        <ul className="space-y-2">
          {[...navItems, ...availableAdminNavs].map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-4 rounded-lg px-3 py-3 text-lg font-medium text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-primary/10 text-primary'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={() => {
                closeMenu();
                logout();
              }}
              className="flex w-full items-center gap-4 rounded-lg px-3 py-3 text-lg font-medium text-muted-foreground transition-all hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </motion.div>
  );
}