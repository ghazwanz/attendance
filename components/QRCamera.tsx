"use client";
import { X } from "lucide-react";

interface CameraScannerProps {
    onStop: () => void;
    isScanning?: boolean;
}

export default function CameraScanner({ onStop, isScanning }: CameraScannerProps) {
    return (
        <div className="mb-6">
            <div className="border-2 border-dashed border-blue-400 rounded-xl p-4 bg-blue-50">
                <div
                    id="qr-reader"
                    className="w-full h-64 rounded-lg overflow-hidden border-2 border-blue-200 bg-black"
                />
            </div>
            {isScanning &&
                <button
                    onClick={onStop}
                    className="mt-3 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                    <X size={16} />
                    Stop Camera
                </button>
            }
        </div>
    );
}
