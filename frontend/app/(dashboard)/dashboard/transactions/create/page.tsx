'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Camera } from 'lucide-react';
import api, { Customer } from '@/lib/api';
import { toast } from 'sonner';
import CameraCapture from '@/components/CameraCapture';

export default function CreateTransactionPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [customerId, setCustomerId] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [durationDays, setDurationDays] = useState('15');
    
    const [items, setItems] = useState([
        { 
            name: '', 
            category: 'Elektronik', 
            brand: '', 
            serial_number: '', 
            market_price: '',
            estimated_value: '', 
            grade: '', 
            image: null as File | null 
        }
    ]);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

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
        setItems([...items, { 
            name: '', 
            category: 'Elektronik', 
            brand: '', 
            serial_number: '', 
            market_price: '',
            estimated_value: '', 
            grade: '', 
            image: null 
        }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const calculateEstimatedValue = (marketPrice: number, grade: string) => {
        const percentageMap: Record<string, number> = {
            'A': 0.90, // 90%
            'B': 0.80, // 80%
            'C': 0.70, // 70%
            'D': 0.50, // 50%
            'E': 0.30, // 30%
        };
        const percentage = percentageMap[grade] || 0;
        return Math.floor(marketPrice * percentage);
    };

    const handleItemChange = (index: number, field: string, value: string | File | null) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;

        // Auto calculate estimated value based on market price and grade
        // @ts-ignore
        if (field === 'market_price' || field === 'grade') {
            const marketPrice = parseFloat(newItems[index].market_price || '0');
            const grade = newItems[index].grade;
            
            if (marketPrice > 0 && grade) {
                 const estimated = calculateEstimatedValue(marketPrice, grade);
                 newItems[index].estimated_value = estimated.toString();
            }
        }

        setItems(newItems);
    };

    const handleCameraCapture = (file: File) => {
        if (activeItemIndex !== null) {
            handleItemChange(activeItemIndex, 'image', file);
            toast.success('Foto berhasil diambil');
        }
    };

    const openCameraFor = (index: number) => {
        setActiveItemIndex(index);
        setIsCameraOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('customer_id', customerId);
            formData.append('loan_amount', loanAmount);
            formData.append('duration_days', durationDays);

            items.forEach((item, index) => {
                formData.append(`items[${index}][name]`, item.name);
                formData.append(`items[${index}][category]`, item.category);
                formData.append(`items[${index}][brand]`, item.brand);
                formData.append(`items[${index}][serial_number]`, item.serial_number);
                formData.append(`items[${index}][estimated_value]`, item.estimated_value);
                
                if (item.grade) {
                    formData.append(`items[${index}][grade]`, item.grade);
                }
                
                if (item.image) {
                    formData.append(`items[${index}][image]`, item.image);
                }
            });

            await api.post('/transactions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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
                            <div key={index} className="grid grid-cols-6 gap-4 items-end border p-4 rounded-lg bg-gray-50">
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
                                
                                {/* New Grade & Pricing Layout */}
                                <div className="col-span-1 space-y-1">
                                    <Label>Harga Pasar</Label>
                                    <Input 
                                        type="number" 
                                        value={item.market_price} 
                                        onChange={e => handleItemChange(index, 'market_price', e.target.value)} 
                                        placeholder="5000000" 
                                    />
                                </div>

                                <div className="col-span-1 space-y-1">
                                    <Label>Grade</Label>
                                    <Select onValueChange={(val) => handleItemChange(index, 'grade', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">Grade A (90%)</SelectItem>
                                            <SelectItem value="B">Grade B (80%)</SelectItem>
                                            <SelectItem value="C">Grade C (70%)</SelectItem>
                                            <SelectItem value="D">Grade D (50%)</SelectItem>
                                            <SelectItem value="E">Grade E (30%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="col-span-2 space-y-1">
                                    <Label>Nilai Taksiran (Auto)</Label>
                                    <Input 
                                        type="number" 
                                        value={item.estimated_value} 
                                        onChange={e => handleItemChange(index, 'estimated_value', e.target.value)} 
                                        placeholder="Calculated..." 
                                        required 
                                        className="bg-gray-100"
                                    />
                                </div>
                                
                                <div className="col-span-4 grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Foto Barang</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden"
                                                id={`file-upload-${index}`}
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleItemChange(index, 'image', file);
                                                }} 
                                            />
                                            <Button type="button" variant="outline" onClick={() => document.getElementById(`file-upload-${index}`)?.click()}>
                                                Upload File
                                            </Button>
                                            <Button type="button" variant="secondary" onClick={() => openCameraFor(index)}>
                                                <Camera className="h-4 w-4 mr-2" /> Kamera
                                            </Button>
                                        </div>
                                        {item.image && (
                                            <p className="text-xs text-green-600 mt-1">File dipilih: {item.image.name}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end items-end h-full">
                                         {items.length > 1 && (
                                            <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
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

            <CameraCapture 
                open={isCameraOpen} 
                onOpenChange={setIsCameraOpen} 
                onCapture={handleCameraCapture} 
            />
        </div>
    );
}
