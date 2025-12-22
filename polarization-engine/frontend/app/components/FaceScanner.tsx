import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface FaceScannerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onScanComplete: (data: any) => void;
}

export default function FaceScanner({ onScanComplete }: FaceScannerProps) {
    const webcamRef = useRef<Webcam>(null);
    const [scanning, setScanning] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const startScan = () => {
        setScanning(true);
        setMessage("Initializing camera...");
    };

    const processScan = async () => {
        if (!webcamRef.current) return;
        setMessage("Analyzing facial markers...");

        // Give the camera a moment to adjust exposure/focus if needed
        const imageSrc = webcamRef.current.getScreenshot();

        if (imageSrc) {
            const blob = await fetch(imageSrc).then(res => res.blob());
            const formData = new FormData();
            formData.append("file", blob, "face.jpg");

            try {
                const res = await axios.post("http://localhost:8000/scan-face", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                if (res.data.error) {
                    setMessage("Error: " + res.data.message);
                    setScanning(false);
                } else {
                    setMessage("Profile calibrated.");
                    setTimeout(() => {
                        onScanComplete(res.data);
                        setScanning(false);
                    }, 1000);
                }
            } catch (err) {
                console.error(err);
                setMessage("Server connection failed.");
                setScanning(false);
            }
        } else {
            setMessage("Camera error. Please try again.");
            setScanning(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="relative w-full h-[500px] bg-gray-50 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                {/* Main Scanner Feed */}
                {!scanning ? (
                    <div className="relative h-full flex flex-col items-center justify-center p-8">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Biometric Authentication</h3>
                        <p className="text-gray-500 text-center mb-8 max-w-sm">
                            Please look directly at the camera to calibrate your content feed.
                        </p>
                        <button
                            onClick={startScan}
                            className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-0.5"
                        >
                            Begin Scan
                        </button>
                        {message && (
                            <p className="mt-4 text-red-500 text-sm font-medium">{message}</p>
                        )}
                    </div>
                ) : (
                    <div className="relative h-full">
                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                            onUserMedia={() => {
                                // Once camera is ready, wait 2 seconds then scan
                                setTimeout(processScan, 2000);
                            }}
                            onUserMediaError={() => {
                                setMessage("Camera permission denied.");
                                setScanning(false);
                            }}
                        />

                        {/* Clean Light Overlay */}
                        <div className="absolute inset-0 bg-white/10" />

                        {/* Scanning Frame */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-64 h-64 border-2 border-white/50 rounded-full relative"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-t-2 border-blue-500 rounded-full"
                                />
                            </motion.div>
                        </div>

                        {/* Status Text */}
                        <div className="absolute bottom-10 left-0 w-full text-center">
                            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                <span className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                                    {message || "Processing..."}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
