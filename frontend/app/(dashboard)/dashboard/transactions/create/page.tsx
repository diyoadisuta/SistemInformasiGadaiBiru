'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    const [durationDays, setDurationDays] = useState('30');

    const [items, setItems] = useState([
        {
            name: '',
            category: 'Elektronik',
            brand: '',
            serial_number: '',
            market_price: '',
            estimated_value: '',
            grade: 'B',
            description: '',
            image: null as File | null,
            imagePreview: '' as string
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
            setCustomers(res.data.data || []);
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
            grade: 'B',
            description: '',
            image: null,
            imagePreview: ''
        }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
        }
    };

    const calculateEstimatedValue = (marketPrice: number, grade: string) => {
        const percentageMap: Record<string, number> = {
            'A': 0.90, // 90% - Sangat Baik
            'B': 0.80, // 80% - Baik
            'C': 0.70, // 70% - Cukup
            'D': 0.50, // 50% - Rusak Ringan
            'E': 0.30, // 30% - Rusak Berat
        };
        const percentage = percentageMap[grade] || 0.70;
        return Math.floor(marketPrice * percentage);
    };

    const handleItemChange = (index: number, field: string, value: string | File | null) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;

        // Handle image preview
        if (field === 'image' && value instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => {
                newItems[index].imagePreview = reader.result as string;
                setItems([...newItems]);
            };
            reader.readAsDataURL(value);
        }

        // Auto calculate estimated value
        if (field === 'market_price' || field === 'grade') {
            const marketPrice = parseFloat(newItems[index].market_price || '0');
            const grade = newItems[index].grade;

            if (marketPrice > 0) {
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
                formData.append(`items[${index}][brand]`, item.brand || '-');
                formData.append(`items[${index}][serial_number]`, item.serial_number);
                formData.append(`items[${index}][estimated_value]`, item.estimated_value);
                formData.append(`items[${index}][description]`, item.description);
                formData.append(`items[${index}][grade]`, item.grade);

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
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Gagal membuat transaksi';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const gradeOptions = [
        { value: 'A', label: 'Grade A (90%)', desc: 'Sangat Baik', icon: 'sentiment_satisfied' },
        { value: 'B', label: 'Grade B (80%)', desc: 'Baik', icon: 'sentiment_neutral' },
        { value: 'C', label: 'Grade C (70%)', desc: 'Cukup', icon: 'sentiment_dissatisfied' },
        { value: 'D', label: 'Grade D (50%)', desc: 'Rusak Ringan', icon: 'build' },
        { value: 'E', label: 'Grade E (30%)', desc: 'Rusak Berat', icon: 'broken_image' },
    ];

    return (
        <div className="flex flex-col gap-6 max-w-[960px] mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap items-center gap-2 text-sm">
                <Link href="/dashboard" className="text-muted-foreground font-medium hover:text-primary transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Home
                </Link>
                <span className="text-muted-foreground font-medium">/</span>
                <Link href="/dashboard/transactions" className="text-muted-foreground font-medium hover:text-primary transition-colors">Transaksi</Link>
                <span className="text-muted-foreground font-medium">/</span>
                <span className="text-primary font-semibold">Transaksi Baru</span>
            </nav>

            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-4 items-end pb-4 border-b border-border">
                <div className="flex flex-col gap-2">
                    <h1 className="text-foreground text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">Transaksi Baru</h1>
                    <p className="text-muted-foreground text-base font-normal leading-normal max-w-2xl">
                        Masukkan data nasabah dan barang jaminan untuk membuat transaksi gadai baru.
                    </p>
                </div>
                <div className="hidden sm:block">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        Sistem Online
                    </span>
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {/* Section: Customer & Loan Data */}
                <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <h3 className="text-foreground text-lg font-bold">Data Peminjaman</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Customer */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-foreground text-sm font-medium" htmlFor="customer">Nasabah *</label>
                            <div className="relative">
                                <select
                                    id="customer"
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                    required
                                    className="w-full h-12 rounded-lg border border-border bg-card text-foreground px-4 pr-10 focus:ring-2 focus:ring-primary focus:border-primary appearance-none transition-all"
                                >
                                    <option value="" disabled>Pilih Nasabah</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id.toString()}>{c.name} - {c.phone}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                            <Link href="/dashboard/customers?action=new" className="text-xs text-primary hover:underline">
                                + Tambah Nasabah Baru
                            </Link>
                        </div>
                        {/* Duration */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-foreground text-sm font-medium" htmlFor="duration">Durasi (Hari) *</label>
                            <div className="relative">
                                <select
                                    id="duration"
                                    value={durationDays}
                                    onChange={(e) => setDurationDays(e.target.value)}
                                    className="w-full h-12 rounded-lg border border-border bg-card text-foreground px-4 pr-10 focus:ring-2 focus:ring-primary focus:border-primary appearance-none transition-all"
                                >
                                    <option value="15">15 Hari</option>
                                    <option value="30">30 Hari</option>
                                    <option value="60">60 Hari</option>
                                    <option value="90">90 Hari</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </div>
                        {/* Loan Amount */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-foreground text-sm font-medium" htmlFor="loanAmount">Nilai Pinjaman (IDR) *</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground font-medium">Rp</span>
                                <input
                                    id="loanAmount"
                                    type="number"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(e.target.value)}
                                    required
                                    placeholder="0"
                                    className="w-full h-12 rounded-lg border border-border bg-card text-foreground pl-12 pr-4 font-semibold text-lg focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border w-full"></div>

                {/* Section: Items */}
                {items.map((item, index) => (
                    <div key={index}>
                        <div className="p-6 sm:p-8 bg-muted/30">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <span className="material-symbols-outlined">devices</span>
                                    </div>
                                    <h3 className="text-foreground text-lg font-bold">Barang Jaminan #{index + 1}</h3>
                                </div>
                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                        Hapus
                                    </button>
                                )}
                            </div>

                            {/* Item Specifications */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Category */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-foreground text-sm font-medium">Kategori *</label>
                                    <div className="relative">
                                        <select
                                            value={item.category}
                                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                            className="w-full h-12 rounded-lg border border-border bg-card text-foreground px-4 pr-10 focus:ring-2 focus:ring-primary focus:border-primary appearance-none transition-all"
                                        >
                                            <option value="Elektronik">Elektronik</option>
                                            <option value="Smartphone">Smartphone</option>
                                            <option value="Laptop">Laptop</option>
                                            <option value="Tablet">Tablet</option>
                                            <option value="Kamera">Kamera</option>
                                            <option value="Gaming Console">Gaming Console</option>
                                            <option value="Smartwatch">Smartwatch</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Brand */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-foreground text-sm font-medium">Merk</label>
                                    <input
                                        type="text"
                                        value={item.brand}
                                        onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                                        placeholder="Contoh: Samsung, Apple, Sony"
                                        className="w-full h-12 rounded-lg border border-border bg-card text-foreground px-4 focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                                    />
                                </div>
                                {/* Model/Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-foreground text-sm font-medium">Model / Nama Barang *</label>
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                        required
                                        placeholder="Contoh: Galaxy S24 Ultra"
                                        className="w-full h-12 rounded-lg border border-border bg-card text-foreground px-4 focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                                    />
                                </div>
                                {/* Serial Number */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-foreground text-sm font-medium">Nomor Seri / IMEI</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={item.serial_number}
                                            onChange={(e) => handleItemChange(index, 'serial_number', e.target.value)}
                                            placeholder="Masukkan nomor identifikasi"
                                            className="w-full h-12 rounded-lg border border-border bg-card text-foreground px-4 pl-10 focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                                            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grade & Valuation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Grade Selection */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-foreground text-sm font-medium">Kondisi / Grade *</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {gradeOptions.map((opt) => (
                                            <label key={opt.value} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`grade-${index}`}
                                                    value={opt.value}
                                                    checked={item.grade === opt.value}
                                                    onChange={(e) => handleItemChange(index, 'grade', e.target.value)}
                                                    className="peer sr-only"
                                                />
                                                <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-card peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary hover:border-primary/50 transition-all h-full text-muted-foreground text-center">
                                                    <span className="material-symbols-outlined text-xl mb-1">{opt.icon}</span>
                                                    <span className="text-xs font-bold">{opt.value}</span>
                                                    <span className="text-[10px]">{opt.desc.split(' ')[0]}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {/* Value */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-foreground text-sm font-medium">Harga Pasaran (IDR)</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground font-medium">Rp</span>
                                            <input
                                                type="number"
                                                value={item.market_price}
                                                onChange={(e) => handleItemChange(index, 'market_price', e.target.value)}
                                                placeholder="0"
                                                className="w-full h-12 rounded-lg border border-border bg-card text-foreground pl-12 pr-4 font-semibold focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-foreground text-sm font-medium">Nilai Taksiran (Auto) *</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground font-medium">Rp</span>
                                            <input
                                                type="number"
                                                value={item.estimated_value}
                                                onChange={(e) => handleItemChange(index, 'estimated_value', e.target.value)}
                                                required
                                                placeholder="Masukkan atau hitung otomatis"
                                                className="w-full h-12 rounded-lg border border-border bg-card text-foreground pl-12 pr-4 font-semibold text-lg focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Dihitung otomatis dari harga pasar × persentase grade</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-foreground text-sm font-medium">Deskripsi / Kelengkapan</label>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        placeholder="Deskripsikan kondisi barang, goresan, penyok, atau kelengkapan charger/box..."
                                        rows={3}
                                        className="w-full rounded-lg border border-border bg-card text-foreground px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Photos */}
                            <div className="mt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <span className="material-symbols-outlined">add_a_photo</span>
                                    </div>
                                    <h4 className="text-foreground text-base font-bold">Foto Barang</h4>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {/* Upload Area */}
                                    <div className="flex gap-3">
                                        <label className="group relative flex flex-col items-center justify-center flex-1 h-32 border-2 border-dashed border-border rounded-xl bg-muted/30 hover:bg-muted/50 hover:border-primary transition-all cursor-pointer">
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="material-symbols-outlined text-3xl text-muted-foreground mb-1 group-hover:text-primary transition-colors">cloud_upload</span>
                                                <p className="text-sm text-muted-foreground"><span className="font-semibold">Upload</span> atau drag & drop</p>
                                                <p className="text-xs text-muted-foreground/70">PNG, JPG max 10MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleItemChange(index, 'image', file);
                                                }}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => openCameraFor(index)}
                                            className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-xl bg-muted/30 hover:bg-muted/50 hover:border-primary transition-all"
                                        >
                                            <span className="material-symbols-outlined text-3xl text-muted-foreground mb-1">photo_camera</span>
                                            <p className="text-sm text-muted-foreground font-semibold">Kamera</p>
                                        </button>
                                    </div>
                                    {/* Preview */}
                                    {item.imagePreview && (
                                        <div className="flex gap-4">
                                            <div className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border">
                                                <img src={item.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleItemChange(index, 'image', null);
                                                        const newItems = [...items];
                                                        newItems[index].imagePreview = '';
                                                        setItems(newItems);
                                                    }}
                                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="h-px bg-border w-full"></div>
                    </div>
                ))}

                {/* Add More Items Button */}
                <div className="p-6 sm:p-8 flex justify-center">
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary transition-all"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Tambah Barang Lainnya
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 sm:px-8 bg-muted/50 border-t border-border flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-5 py-2.5 text-sm font-bold text-muted-foreground bg-transparent hover:bg-muted rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
                    </button>
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
