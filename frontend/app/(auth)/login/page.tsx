'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.get('http://localhost:8000/sanctum/csrf-cookie'); 
            const response = await api.post('/login', { email, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            toast.success('Login berhasil! Mengalihkan...');
            router.push('/dashboard');
        } catch (error: any) {
            console.error(error);
            toast.error('Login gagal. Periksa email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Brand & Aesthetic */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 flex-col justify-between p-12 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616077168079-7e09a676505d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 opacity-90"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-2xl font-bold">
                        <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <Coins className="h-6 w-6 text-blue-300" />
                        </div>
                        Gadai Biru
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Solusi Gadai Elektronik Terpercaya
                    </h1>
                    <p className="text-lg text-blue-100 leading-relaxed opacity-90">
                        Kelola transaksi gadai, perpanjangan, dan pelunasan dengan sistem yang modern, aman, dan efisien.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-blue-300/60 pb-4">
                    © 2024 Sistem Informasi Gadai Elektronik (SIGE) v1.0
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center bg-gray-50/50 p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Selamat Datang Kembali</h2>
                        <p className="text-gray-500">Masukan kredensial Anda untuk mengakses dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        type="email"
                                        required
                                        className="pl-9 h-11 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-9 h-11 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Masuk Dashboard <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                    
                    <div className="text-center text-sm text-gray-400">
                        <p>Butuh bantuan akses? Hubungi Administrator.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
