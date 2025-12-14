'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Search, User, Phone, MapPin } from 'lucide-react';
import api, { Customer } from '@/lib/api';
import { toast } from 'sonner';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Form inputs
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        nik: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/customers');
            setCustomers(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat data nasabah');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setProcessing(true);
        try {
            await api.post('/customers', formData);
            toast.success('Nasabah berhasil ditambahkan');
            setOpen(false);
            setFormData({ name: '', phone: '', address: '', nik: '' });
            fetchCustomers();
        } catch (error) {
            console.error(error);
            toast.error('Gagal menambah nasabah');
        } finally {
            setProcessing(false);
        }
    };

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.phone.includes(search) ||
        c.nik?.includes(search)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Data Nasabah</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <PlusCircle className="h-4 w-4" /> Tambah Nasabah
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Nasabah Baru</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nama Lengkap</Label>
                                <Input 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    placeholder="Nama Nasabah" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nomor Nik (KTP)</Label>
                                <Input 
                                    value={formData.nik} 
                                    onChange={e => setFormData({...formData, nik: e.target.value})} 
                                    placeholder="16 Digit NIK" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>No. Telepon</Label>
                                <Input 
                                    value={formData.phone} 
                                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    placeholder="08123456789" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Alamat</Label>
                                <Input 
                                    value={formData.address} 
                                    onChange={e => setFormData({...formData, address: e.target.value})} 
                                    placeholder="Alamat Lengkap" 
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={processing}>Simpan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Nasabah</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                            placeholder="Cari nasabah..." 
                            className="pl-8 max-w-sm" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>NIK</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Telepon</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead className="text-right">Bergabung</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">Memuat data...</TableCell>
                                </TableRow>
                            ) : filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">Tidak ada data nasabah</TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>{customer.nik || '-'}</TableCell>
                                        <TableCell className="font-medium">{customer.name}</TableCell>
                                        <TableCell>{customer.phone}</TableCell>
                                        <TableCell>{customer.address}</TableCell>
                                        <TableCell className="text-right">{new Date(customer.created_at || Date.now()).toLocaleDateString('id-ID')}</TableCell>
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
