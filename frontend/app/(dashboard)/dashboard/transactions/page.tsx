'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api, { Transaction } from '@/lib/api';
import { format } from 'date-fns';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const perPage = 10;

    useEffect(() => {
        fetchTransactions();
    }, [statusFilter, currentPage]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params: any = { page: currentPage, per_page: perPage };
            if (statusFilter) params.status = statusFilter;
            const response = await api.get('/transactions', { params });
            setTransactions(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            auctioned: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
        };
        const labels: Record<string, string> = {
            active: 'Aktif',
            completed: 'Ditebus',
            overdue: 'Jatuh Tempo',
            auctioned: 'Dilelang',
        };
        const dotColors: Record<string, string> = {
            active: 'bg-blue-500',
            completed: 'bg-green-500',
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
        if (!name) return 'NA';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const filteredTransactions = transactions.filter(trx => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            trx.transaction_number?.toLowerCase().includes(query) ||
            trx.customer?.name?.toLowerCase().includes(query) ||
            trx.items?.some(item => item.name?.toLowerCase().includes(query))
        );
    });

    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);

    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumbs */}
            <nav className="flex text-sm font-medium text-muted-foreground mb-2">
                <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground font-semibold">Transaksi Gadai</span>
            </nav>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Transaksi Gadai</h1>
                    <p className="text-muted-foreground text-base">Kelola transaksi gadai, perpanjangan, dan pelunasan.</p>
                </div>
                <Link
                    href="/dashboard/transactions/create"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 w-full md:w-auto justify-center"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                    Transaksi Baru
                </Link>
            </div>

            {/* Filters & Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                {/* Search Bar */}
                <div className="md:col-span-5 lg:col-span-6 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="material-symbols-outlined text-muted-foreground" style={{ fontSize: '20px' }}>search</span>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border-none bg-muted rounded-lg text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:bg-card transition-colors"
                        placeholder="Cari No. Transaksi, Nasabah, atau Barang..."
                    />
                </div>

                {/* Status Filter */}
                <div className="md:col-span-3 lg:col-span-3 relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="block w-full pl-3 pr-10 py-2.5 border-none bg-muted rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary cursor-pointer appearance-none"
                    >
                        <option value="">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="completed">Ditebus</option>
                        <option value="overdue">Jatuh Tempo</option>
                        <option value="auctioned">Dilelang</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_drop_down</span>
                    </div>
                </div>

                {/* Extra Actions */}
                <div className="md:col-span-4 lg:col-span-3 flex justify-end gap-2">
                    <button
                        onClick={() => { setStatusFilter(''); setSearchQuery(''); setCurrentPage(1); }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground transition-colors"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span>
                        <span className="hidden lg:inline">Reset</span>
                    </button>
                </div>
            </div>

            {/* Data Table Card */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] table-auto text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID Transaksi</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detail Barang</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pinjaman</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nasabah</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jatuh Tempo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl">inbox</span>
                                            <p>Belum ada transaksi</p>
                                            <Link href="/dashboard/transactions/create" className="text-primary hover:underline text-sm font-medium">
                                                Buat transaksi pertama
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((trx) => (
                                    <tr key={trx.id} className="group hover:bg-primary/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-foreground">#{trx.transaction_number}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {trx.items?.length || 0} barang
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-muted-foreground">inventory_2</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">
                                                        {trx.items?.[0]?.name || 'Tidak ada barang'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {trx.items?.[0]?.category || '-'} • {trx.items?.[0]?.brand || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-foreground">{formatCurrency(trx.loan_amount)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(trx.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                                    {getInitials(trx.customer?.name || '')}
                                                </div>
                                                <span className="text-sm text-primary hover:underline font-medium">
                                                    {trx.customer?.name || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {trx.due_date ? format(new Date(trx.due_date), 'dd MMM yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/dashboard/transactions/${trx.id}`}
                                                    className="text-muted-foreground hover:text-primary p-1.5 rounded transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                                                </Link>
                                                <button
                                                    className="text-muted-foreground hover:text-primary p-1.5 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                                                </button>
                                                <button
                                                    className="text-muted-foreground hover:text-destructive p-1.5 rounded transition-colors"
                                                    title="Hapus"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && filteredTransactions.length > 0 && (
                    <div className="px-6 py-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan <span className="font-medium text-foreground">{startItem}</span> sampai <span className="font-medium text-foreground">{endItem}</span> dari <span className="font-medium text-foreground">{totalItems}</span> data
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-border text-muted-foreground disabled:opacity-50 hover:bg-muted transition-colors"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'hover:bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-border text-muted-foreground disabled:opacity-50 hover:bg-muted transition-colors"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
