'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api, { TransactionItem } from '@/lib/api';
import { format } from 'date-fns';

export default function InventoryPage() {
    const [items, setItems] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await api.get('/inventory');
            setItems(response.data.data);
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
            <h1 className="text-3xl font-bold tracking-tight">Barang Jaminan</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Barang Aktif (Gadai Berjalan)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No Transaksi</TableHead>
                                <TableHead>Nama Barang</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Merk / SN</TableHead>
                                <TableHead>Taksiran Nilai</TableHead>
                                <TableHead>Jatuh Tempo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">Memuat data...</TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">Tidak ada barang aktif</TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium text-blue-600">
                                            {item.transaction?.transaction_number}
                                        </TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.brand}</span>
                                                <span className="text-xs text-gray-500">{item.serial_number || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatCurrency(item.estimated_value)}</TableCell>
                                        <TableCell>
                                            {item.transaction?.due_date ? format(new Date(item.transaction.due_date), 'dd MMM yyyy') : '-'}
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
