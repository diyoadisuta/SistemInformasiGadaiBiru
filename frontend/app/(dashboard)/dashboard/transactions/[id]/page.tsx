'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, Clock, Banknote, CheckCircle, Printer } from 'lucide-react';
import api, { Transaction } from '@/lib/api';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

export default function TransactionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);

    // Action States
    const [extendDays, setExtendDays] = useState('15');
    const [repayAmount, setRepayAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (params.id) fetchTransaction();
    }, [params.id]);

    const fetchTransaction = async () => {
        try {
            const res = await api.get(`/transactions/${params.id}`);
            setTransaction(res.data);
            if (res.data) {
                // Pre-fill repay amount with total loan + interest (simplified)
                setRepayAmount((parseFloat(res.data.loan_amount) + parseFloat(res.data.interest_amount)).toString());
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat transaksi');
        } finally {
            setLoading(false);
        }
    };

    const handleExtend = async () => {
        if (!transaction) return;
        setProcessing(true);
        try {
            // Logic: Pay interest to extend
            await api.post(`/transactions/${transaction.id}/extend`, {
                amount: transaction.interest_amount, // Assuming paying interest extends it
                days: parseInt(extendDays)
            });
            toast.success('Perpanjangan berhasil');
            fetchTransaction(); // Refresh data
        } catch (error) {
            console.error(error);
            toast.error('Gagal memperpanjang transaksi');
        } finally {
            setProcessing(false);
        }
    };

    const handleRepay = async () => {
        if (!transaction) return;
        setProcessing(true);
        try {
            await api.post(`/transactions/${transaction.id}/repay`, {
                amount: parseFloat(repayAmount)
            });
            toast.success('Pelunasan berhasil');
            fetchTransaction();
        } catch (error) {
            console.error(error);
            toast.error('Gagal melunasi transaksi');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div>Memuat...</div>;
    if (!transaction) return <div>Data tidak ditemukan</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">{transaction.transaction_number}</CardTitle>
                                <CardDescription>Dibuat pada {format(new Date(transaction.created_at || new Date()), 'dd MMM yyyy')}</CardDescription>
                            </div>
                            <Badge variant={transaction.status === 'active' ? 'default' : transaction.status === 'completed' ? 'secondary' : 'destructive'}>
                                {transaction.status === 'active' ? 'AKTIF' : transaction.status === 'completed' ? 'LUNAS' : transaction.status.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Nasabah</h3>
                                <p className="text-lg font-medium">{transaction.customer?.name}</p>
                                <p className="text-sm text-gray-400">{transaction.customer?.phone}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Petugas</h3>
                                <p className="text-lg font-medium">Admin (System)</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Barang Jaminan</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-right">Taksiran</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transaction.items?.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-gray-400">{item.brand} - {item.serial_number}</div>
                                            </TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell className="text-right">Rp {parseFloat(item.estimated_value).toLocaleString('id-ID')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions & Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Pinjaman</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Pokok Pinjaman</span>
                                <span className="font-medium">Rp {Number(transaction.loan_amount).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Bunga ({transaction.interest_rate}%)</span>
                                <span className="font-medium text-red-600">+ Rp {Number(transaction.interest_amount).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center">
                                <span className="font-bold">Total Tagihan</span>
                                <span className="font-bold text-xl">
                                    Rp {(Number(transaction.loan_amount) + Number(transaction.interest_amount)).toLocaleString('id-ID')}
                                </span>
                            </div>
                            
                            <div className="pt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>Jatuh Tempo: <b>{format(new Date(transaction.due_date), 'dd MMM yyyy')}</b></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {transaction.status === 'active' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Aksi Transaksi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start mb-2" onClick={async () => {
                                            try {
                                                const response = await api.get(`/transactions/${transaction.id}/print`, { responseType: 'blob' });
                                                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
                                                window.open(url, '_blank');
                                            } catch (e) {
                                                console.error(e);
                                                toast.error('Gagal mencetak dokumen');
                                            }
                                        }}>
                                            <Printer className="mr-2 h-4 w-4" /> Cetak Surat Gadai
                                        </Button>
                                    </DialogTrigger>
                                </Dialog>

                                {/* Extension Dialog */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Clock className="mr-2 h-4 w-4" /> Perpanjang Gadai
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Perpanjang Gadai</DialogTitle>
                                            <DialogDescription>
                                                Perpanjang masa gadai dengan membayar bunga berjalan.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Biaya Perpanjangan (Bunga)</Label>
                                                <div className="text-2xl font-bold">Rp {Number(transaction.interest_amount).toLocaleString('id-ID')}</div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tambah Durasi (Hari)</Label>
                                                <Input type="number" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} />
                                                <p className="text-xs text-gray-500">
                                                    Jatuh tempo baru: {format(addDays(new Date(transaction.due_date), parseInt(extendDays || '0')), 'dd MMM yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleExtend} disabled={processing}>Confirm Perpanjang</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {/* Repayment Dialog */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                                            <CheckCircle className="mr-2 h-4 w-4" /> Pelunasan Barang
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Pelunasan Transaksi</DialogTitle>
                                            <DialogDescription>
                                                Lunasi total tagihan untuk mengambil barang jaminan.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Total Tagihan</Label>
                                                <div className="text-2xl font-bold">
                                                    Rp {(Number(transaction.loan_amount) + Number(transaction.interest_amount)).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Jumlah Bayar</Label>
                                                <Input 
                                                    type="number" 
                                                    value={repayAmount} 
                                                    onChange={(e) => setRepayAmount(e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleRepay} disabled={processing}>Konfirmasi Pelunasan</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
