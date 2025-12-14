'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import api, { Customer } from '@/lib/api';
import { toast } from 'sonner';

export default function CreateTransactionPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [customerId, setCustomerId] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [durationDays, setDurationDays] = useState('15');
    
    const [items, setItems] = useState([
        { name: '', category: 'Elektronik', brand: '', serial_number: '', estimated_value: '' }
    ]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { name: '', category: 'Elektronik', brand: '', serial_number: '', estimated_value: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: string, value: string) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                customer_id: customerId,
                loan_amount: parseFloat(loanAmount),
                duration_days: parseInt(durationDays),
                items: items.map(item => ({
                    ...item,
                    estimated_value: parseFloat(item.estimated_value)
                }))
            };

            await api.post('/transactions', payload);
            toast.success('Transaksi berhasil dibuat');
            router.push('/dashboard/transactions');
        } catch (error) {
            console.error(error);
            toast.error('Gagal membuat transaksi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Buat Transaksi Baru</h1>

            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Data Peminjaman</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nasabah</Label>
                                <Select onValueChange={setCustomerId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Nasabah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name} - {c.phone}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Durasi (Hari)</Label>
                                <Input type="number" value={durationDays} onChange={e => setDurationDays(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Nilai Pinjaman (IDR)</Label>
                                <Input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} required placeholder="Contoh: 1000000" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Barang Jaminan</span>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                <Plus className="h-4 w-4 mr-2" /> Tambah Barang
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-6 gap-2 items-end border p-4 rounded-lg bg-gray-50">
                                <div className="col-span-2 space-y-1">
                                    <Label>Nama Barang</Label>
                                    <Input value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} placeholder="Laptop Asus ROG" required />
                                </div>
                                <div className="col-span-1 space-y-1">
                                    <Label>Merk</Label>
                                    <Input value={item.brand} onChange={e => handleItemChange(index, 'brand', e.target.value)} placeholder="Asus" />
                                </div>
                                <div className="col-span-1 space-y-1">
                                    <Label>No. Seri</Label>
                                    <Input value={item.serial_number} onChange={e => handleItemChange(index, 'serial_number', e.target.value)} placeholder="SN123..." />
                                </div>
                                <div className="col-span-1 space-y-1">
                                    <Label>Nilai Taksiran</Label>
                                    <Input type="number" value={item.estimated_value} onChange={e => handleItemChange(index, 'estimated_value', e.target.value)} placeholder="2000000" required />
                                </div>
                                <div className="col-span-1">
                                    {items.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Memproses...' : 'Simpan Transaksi'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
