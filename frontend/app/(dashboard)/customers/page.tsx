'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api';
import { Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    const fetchCustomers = () => {
        api.get(`/customers?search=${search}`)
            .then(res => setCustomers(res.data.data))
            .catch(console.error);
    };

    useEffect(() => {
        fetchCustomers();
    }, [search]); // Debounce recommended for prod

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Data Nasabah</h2>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Nasabah
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama, NIK, atau HP..."
                            className="max-w-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>Daftar semua nasabah terdaftar.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>NIK</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>No. HP</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead className="text-right">Trust Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Data tidak ditemukan</TableCell>
                                </TableRow>
                            ) : (
                                customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium">{customer.nik}</TableCell>
                                        <TableCell>{customer.name}</TableCell>
                                        <TableCell>{customer.phone}</TableCell>
                                        <TableCell>{customer.address}</TableCell>
                                        <TableCell className="text-right">{customer.trust_score}</TableCell>
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
