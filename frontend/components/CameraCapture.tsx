'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCapture: (file: File) => void;
}

export default function CameraCapture({ open, onOpenChange, onCapture }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [loading, setLoading] = useState(false);

    const startCamera = useCallback(async () => {
        setLoading(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    }, [onOpenChange]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (open) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
        };
    }, [open, startCamera, stopCamera]);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                        onCapture(file);
                        onOpenChange(false);
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ambil Foto</DialogTitle>
                </DialogHeader>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                    {loading && <RefreshCw className="h-8 w-8 text-white animate-spin" />}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={capturePhoto} disabled={loading || !stream}>
                        <Camera className="mr-2 h-4 w-4" /> Ambil Foto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
