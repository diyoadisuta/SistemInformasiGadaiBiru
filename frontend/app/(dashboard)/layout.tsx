'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Banknote, Package, LogOut, Menu, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

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

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/customers', label: 'Nasabah', icon: Users },
        { href: '/dashboard/transactions', label: 'Transaksi Gadai', icon: Banknote },
        { href: '/dashboard/inventory', label: 'Barang Jaminan', icon: Package },
        { href: '/dashboard/reports', label: 'Laporan', icon: FileText },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white shadow-md transition-all duration-300 flex flex-col",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="p-4 border-b flex items-center justify-between">
                    <h1 className={cn("font-bold text-xl text-blue-600", !isSidebarOpen && "hidden")}>Gadai Biru</h1>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={pathname === item.href ? "default" : "ghost"}
                                className={cn("w-full justify-start gap-2", !isSidebarOpen && "justify-center px-0")}
                            >
                                <item.icon className="h-5 w-5" />
                                {isSidebarOpen && <span>{item.label}</span>}
                            </Button>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                        {isSidebarOpen && <span>Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    );
}
