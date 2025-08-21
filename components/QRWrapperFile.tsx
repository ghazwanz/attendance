"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Upload, CheckCircle, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import UploadCard from "./QRUpload";
import CameraScanner from "./QRCamera";

export default function QRWrapperFile() {
    const [qrResult, setQrResult] = useState<string | null>(null);
    const [qrData, setQrData] = useState<string |null>(null)
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState<"upload" | "camera">("upload");
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        if (!html5QrCodeRef.current) {
            html5QrCodeRef.current = new Html5Qrcode("qr-reader");
        }
        return () => {
            html5QrCodeRef.current?.stop().catch(() => { });
        };
    }, []);

    const startCameraScan = async () => {
        if (!html5QrCodeRef.current) return;
        setIsScanning(true);
        setScanMode("camera");

        // 🔑 Pastikan render sudah jalan
        setTimeout(async () => {
            try {
                await html5QrCodeRef.current!.start(
                    { facingMode: "environment" },
                    { fps: 30, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        setQrResult(decodedText);
                        setIsScanning(false);
                        html5QrCodeRef.current?.stop();
                    },
                    (err:any)=>{
                        console.log(err.message)
                    }
                );
            } catch (err: any) {
                setQrResult("❌ Failed to open camera: " + err.message);
                setIsScanning(false);
            }
        }, 100); // beri jeda 100ms agar <div id="qr-reader"> siap
    };


    const stopCameraScan = async () => {
        try {
            await html5QrCodeRef.current?.stop();
            setIsScanning(false);
            // setScanMode("upload");
        } catch (err) {
            console.error("Error stopping camera:", err);
        }
    };

    const handleFileSelect = async (file: File) => {
        if (!file || !html5QrCodeRef.current) return;
        try {
            setIsScanning(true);
            const result = await html5QrCodeRef.current.scanFile(file, true);
            const jsonResult = JSON.parse(result);
            console.log("QR Code Result:", jsonResult);
            setQrResult(result);
        } catch (err: any) {
            setQrResult("❌ Failed to read QR from image: " + err.message);
        } finally {
            setIsScanning(false);
        }
    };

    const resetScanner = () => {
        
        setQrResult(null);
        // setScanMode("upload");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Upload Your QR Code
                    </h2>
                    <p className="text-sm text-gray-500">
                        Show Your Brand Transparency With Image!
                    </p>
                </div>

                {/* Upload or Camera */}
                {scanMode === "upload" && (
                    <UploadCard onFileSelect={handleFileSelect} disabled={isScanning} />
                )}
                {scanMode === "camera" && <CameraScanner isScanning={isScanning} onStop={stopCameraScan} />}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setScanMode("upload")}
                        disabled={isScanning}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Upload size={16} />
                        Upload Image
                    </button>
                    <button
                        onClick={startCameraScan}
                        disabled={isScanning}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Camera size={16} />
                        Scan Camera
                    </button>
                </div>

                {/* Loading */}
                {isScanning && scanMode === "upload" && (
                    <div className="mt-4 text-center text-blue-600 flex justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Processing QR code...
                    </div>
                )}

                {/* Result */}
                {qrResult && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                    QR Code Result:
                                </p>
                                <p className="text-sm text-gray-600 break-all">{qrResult}</p>
                            </div>
                            <button
                                onClick={resetScanner}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Hidden div untuk camera init */}
                {scanMode !== "camera" && <div id="qr-reader" className="hidden" />}

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-gray-400">
                    Powered by html5-qrcode
                </div>
            </div>
        </div>
    );
}
