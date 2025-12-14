'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Banknote, Package, FileText, ArrowRight, PlusCircle, Wallet, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Selamat datang kembali! Berikut ringkasan aktivitas.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/dashboard/transactions">
                            <PlusCircle className="mr-2 h-4 w-4" /> Transaksi Baru
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Nasabah</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats?.total_customers || 0}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Transaksi Aktif</CardTitle>
                        <Package className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats?.active_loans_count || 0}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Pinjaman</CardTitle>
                        <Banknote className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={stats?.active_loans_total}>
                            {loading ? '...' : formatCurrency(stats?.active_loans_total)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Estimasi Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate text-green-600">
                            {loading ? '...' : formatCurrency(stats?.potential_profit)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/dashboard/transactions">
                    <Card className="group hover:border-blue-500 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                <Wallet className="h-5 w-5" /> Kelola Transaksi
                            </CardTitle>
                            <CardDescription>Buat gadai baru, perpanjang, atau pelunasan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm font-medium text-blue-600">
                                Buka Transaksi <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/customers">
                    <Card className="group hover:border-blue-500 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                <Users className="h-5 w-5" /> Kelola Nasabah
                            </CardTitle>
                            <CardDescription>Tambah nasabah baru atau lihat data nasabah.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm font-medium text-blue-600">
                                Buka Nasabah <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/reports">
                    <Card className="group hover:border-blue-500 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                <FileText className="h-5 w-5" /> Laporan Lengkap
                            </CardTitle>
                            <CardDescription>Analisis performa bisnis dan keuangan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm font-medium text-blue-600">
                                Buka Laporan <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
