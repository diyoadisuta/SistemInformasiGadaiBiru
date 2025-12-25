'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/dashboard/customers', label: 'Nasabah', icon: 'group' },
    { href: '/dashboard/transactions', label: 'Transaksi', icon: 'receipt_long' },
    { href: '/dashboard/inventory', label: 'Inventaris', icon: 'inventory_2' },
    { href: '/dashboard/reports', label: 'Laporan', icon: 'bar_chart' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userName, setUserName] = useState('Petugas');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, [router]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('token');
            router.push('/login');
        }
    };

    return (
        <div className={cn("flex h-screen w-full overflow-hidden", isDarkMode && "dark")}>
            {/* Sidebar */}
            <aside className="w-64 h-full flex-col justify-between bg-card border-r border-border hidden md:flex overflow-y-auto">
                <div className="flex flex-col gap-4 p-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-2 py-3">
                        <div className="bg-primary/10 text-primary flex items-center justify-center rounded-lg w-10 h-10">
                            <span className="material-symbols-outlined text-3xl">diamond</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-foreground text-lg font-bold leading-tight">SIGE System</h1>
                            <p className="text-muted-foreground text-xs font-medium">Portal Petugas Gadai</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1 mt-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className={cn("material-symbols-outlined", isActive && "filled")}>{item.icon}</span>
                                    <p className={cn("text-sm leading-normal", isActive ? "font-semibold" : "font-medium")}>{item.label}</p>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center justify-start gap-3 rounded-lg h-10 px-3 hover:bg-destructive/10 text-destructive text-sm font-bold transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="truncate">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between border-b border-border bg-card px-6 md:px-8 py-3 z-10">
                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 text-foreground md:hidden">
                        <button
                            className="p-1 -ml-2 text-muted-foreground"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 flex items-center gap-4 md:ml-0 ml-4 max-w-xl">
                        <div className="relative w-full max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nasabah, ID, atau barang..."
                                className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center justify-end gap-3 md:gap-6">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="flex items-center justify-center rounded-full w-10 h-10 hover:bg-muted text-muted-foreground transition-colors"
                        >
                            <span className="material-symbols-outlined">
                                {isDarkMode ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        {/* Notifications */}
                        <div className="flex gap-1">
                            <button className="flex items-center justify-center rounded-full w-10 h-10 hover:bg-muted text-muted-foreground transition-colors relative">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card"></span>
                            </button>
                            <button className="flex items-center justify-center rounded-full w-10 h-10 hover:bg-muted text-muted-foreground transition-colors">
                                <span className="material-symbols-outlined">chat_bubble</span>
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3">
                            <div
                                className="bg-primary/20 text-primary flex items-center justify-center rounded-full w-9 h-9 border-2 border-border font-bold text-sm"
                            >
                                PS
                            </div>
                            <div className="hidden md:flex flex-col">
                                <span className="text-sm font-semibold text-foreground">{userName}</span>
                                <span className="text-xs text-muted-foreground">Officer ID: #001</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
                        <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-4">
                            <div className="flex items-center gap-3 px-2 py-3 mb-4">
                                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-lg w-10 h-10">
                                    <span className="material-symbols-outlined text-3xl">diamond</span>
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-foreground text-lg font-bold leading-tight">SIGE System</h1>
                                    <p className="text-muted-foreground text-xs font-medium">Portal Petugas Gadai</p>
                                </div>
                            </div>
                            <nav className="flex flex-col gap-1">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "hover:bg-muted text-muted-foreground"
                                            )}
                                        >
                                            <span className="material-symbols-outlined">{item.icon}</span>
                                            <p className="text-sm font-medium leading-normal">{item.label}</p>
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="mt-4 pt-4 border-t border-border">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-lg h-10 px-3 hover:bg-destructive/10 text-destructive text-sm font-bold"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-background">
                    <div className="max-w-[1200px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
