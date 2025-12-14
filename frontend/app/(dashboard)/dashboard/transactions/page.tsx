'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api, { Transaction } from '@/lib/api';
import { format } from 'date-fns';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [statusFilter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const response = await api.get('/transactions', { params });
            setTransactions(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Transaksi Gadai</h1>
                <Link href="/dashboard/transactions/create">
                    <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" /> Baru
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Transaksi</CardTitle>
                    <div className="flex gap-4 mt-2">
                        <Button variant={statusFilter === '' ? 'default' : 'outline'} onClick={() => setStatusFilter('')} size="sm">Semua</Button>
                        <Button variant={statusFilter === 'active' ? 'default' : 'outline'} onClick={() => setStatusFilter('active')} size="sm">Aktif</Button>
                        <Button variant={statusFilter === 'completed' ? 'default' : 'outline'} onClick={() => setStatusFilter('completed')} size="sm">Lunas</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No Transaksi</TableHead>
                                <TableHead>Nasabah</TableHead>
                                <TableHead>Tanggal Jatuh Tempo</TableHead>
                                <TableHead>Nilai Pinjaman</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">Memuat data...</TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">Belum ada transaksi</TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((trx) => (
                                    <TableRow key={trx.id}>
                                        <TableCell className="font-medium">{trx.transaction_number}</TableCell>
                                        <TableCell>{trx.customer?.name}</TableCell>
                                        <TableCell>{format(new Date(trx.due_date), 'dd MMM yyyy')}</TableCell>
                                        <TableCell>{formatCurrency(trx.loan_amount)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                trx.status === 'active' ? 'bg-green-100 text-green-800' :
                                                trx.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {trx.status.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/dashboard/transactions/${trx.id}`}>
                                                <Button variant="outline" size="sm">Detail</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
