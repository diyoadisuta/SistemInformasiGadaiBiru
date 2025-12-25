'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api, { Transaction } from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, transactionsRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/transactions?per_page=5')
            ]);
            setStats(statsRes.data);
            setRecentTransactions(transactionsRes.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    const getTodayDate = () => {
        return format(new Date(), "EEEE, d MMMM yyyy", { locale: id });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            auctioned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        };
        const labels: Record<string, string> = {
            active: 'Aktif',
            completed: 'Selesai',
            overdue: 'Jatuh Tempo',
            auctioned: 'Dilelang',
        };
        const dotColors: Record<string, string> = {
            active: 'bg-green-500',
            completed: 'bg-blue-500',
            overdue: 'bg-red-500',
            auctioned: 'bg-amber-500',
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || dotColors.active}`}></span>
                {labels[status] || status}
            </span>
        );
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">{getGreeting()}, Petugas</h2>
                    <p className="text-muted-foreground mt-1">Ringkasan untuk {getTodayDate()}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Sistem Online
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 - Total Active Pawns */}
                <div className="flex flex-col p-5 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <span className="material-symbols-outlined">diamond</span>
                        </div>
                        <span className="text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">Aktif</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">Total Gadai Aktif</p>
                    <p className="text-foreground text-2xl font-bold mt-1">
                        {loading ? '...' : stats?.active_loans_count || 0}
                    </p>
                </div>

                {/* Card 2 - Today's Transactions */}
                <div className="flex flex-col p-5 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined">swap_horiz</span>
                        </div>
                        <span className="text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
                            +{stats?.today_transactions || 0}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">Transaksi Hari Ini</p>
                    <p className="text-foreground text-2xl font-bold mt-1">
                        {loading ? '...' : stats?.today_transactions || 0}
                    </p>
                </div>

                {/* Card 3 - Overdue */}
                <div className="flex flex-col p-5 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                        {(stats?.overdue_count || 0) > 0 && (
                            <span className="text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded text-xs font-semibold">Perhatian</span>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">Jatuh Tempo</p>
                    <p className="text-foreground text-2xl font-bold mt-1">
                        {loading ? '...' : stats?.overdue_count || 0}
                    </p>
                </div>

                {/* Card 4 - Total Loan Amount */}
                <div className="flex flex-col p-5 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <span className="text-muted-foreground text-xs">Total Pinjaman</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">Total Pinjaman Aktif</p>
                    <p className="text-foreground text-2xl font-bold mt-1 tracking-tight">
                        {loading ? '...' : formatCurrency(stats?.active_loans_total || 0)}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-foreground mb-4">Akses Cepat</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/dashboard/transactions?action=new" className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-all group">
                        <div className="bg-primary text-white p-3 rounded-full shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">add</span>
                        </div>
                        <span className="font-semibold text-foreground">Gadai Baru</span>
                    </Link>
                    <Link href="/dashboard/transactions" className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-green-500/50 hover:bg-muted/50 transition-all group">
                        <div className="bg-green-600 text-white p-3 rounded-full shadow-lg shadow-green-600/30 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">price_check</span>
                        </div>
                        <span className="font-semibold text-foreground">Tebus Barang</span>
                    </Link>
                    <Link href="/dashboard/transactions" className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-amber-500/50 hover:bg-muted/50 transition-all group">
                        <div className="bg-amber-500 text-white p-3 rounded-full shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">update</span>
                        </div>
                        <span className="font-semibold text-foreground">Perpanjang</span>
                    </Link>
                    <Link href="/dashboard/customers?action=new" className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-muted-foreground/50 hover:bg-muted/50 transition-all group">
                        <div className="bg-slate-600 text-white p-3 rounded-full shadow-lg shadow-slate-600/30 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">person_add</span>
                        </div>
                        <span className="font-semibold text-foreground">Nasabah Baru</span>
                    </Link>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">Transaksi Terbaru</h3>
                    <Link href="/dashboard/transactions" className="text-primary text-sm font-semibold hover:underline">
                        Lihat Semua
                    </Link>
                </div>
                <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                                <th className="px-6 py-4">ID Transaksi</th>
                                <th className="px-6 py-4">Nasabah</th>
                                <th className="px-6 py-4">Barang</th>
                                <th className="px-6 py-4">Pinjaman</th>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                        Belum ada transaksi
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-muted-foreground">
                                            #{transaction.transaction_number}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-muted rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                    {getInitials(transaction.customer?.name || 'NA')}
                                                </div>
                                                {transaction.customer?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {transaction.items?.[0]?.name || '-'}
                                            {transaction.items?.length > 1 && ` +${transaction.items.length - 1}`}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {formatCurrency(transaction.loan_amount)}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {transaction.start_date ? format(new Date(transaction.start_date), 'dd MMM yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(transaction.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/dashboard/transactions/${transaction.id}`}
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">more_vert</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Spacer */}
            <div className="h-10"></div>
        </div>
    );
}
