import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeResult } from 'html5-qrcode';
import { createClient } from '@/lib/supabase/client';

interface QRScannerProps {
  onScanSuccess?: (userId: string) => void;
  onScanError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const supabase = createClient();

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanning = () => {
    setIsScanning(true);
    setError(null);
    setSuccess(null);

    // Enhanced configuration for better QR code detection
    const config = {
      fps: 20,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
      // Support multiple formats
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      // Enhanced detection settings
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      // Camera constraints for better quality
      videoConstraints: {
        facingMode: "environment", // Use back camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    const onScanSuccessHandler = async (decodedText:any, decodedResult: Html5QrcodeResult) => {
      try {
        alert('QR Code detected:'+ decodedText.user_id);

        // Stop scanning
        await scannerRef.current?.clear();
        setIsScanning(false);

        const data = JSON.parse(decodedText)
        // Parse the QR code data
        try {
          alert('Parsed user_id: ' + data.user_id);
        } catch {
          throw new Error('Invalid QR code format - not valid JSON');
        }

        if (!data?.user_id) {
          throw new Error('Invalid QR code format - user_id not found');
        }

        // Verify user exists in database
        const { data: user, error: userError } = await supabase
          .from('users') // Adjust table name as needed
          .select('id, name, role')
          .eq('id', data.user_id)
          .single();

        if (userError || !user) {
          throw new Error(`User not found in database ${user} \n userError: ${userError?.message}`);
        }

        const status = new Date().getHours() < 8 ? 'hadir' : 'terlambat';
        // Insert attendance record
        const { error: attendanceError } = await supabase
          .from('attendances') // Adjust table name as needed
          .insert({
            user_id: data.user_id,
            date: new Date().toISOString(),
            check_in: new Date().toISOString(),
            check_out: null, // Set to null for check-in
            notes: '',
            created_at: new Date().toISOString(),
            status: status.toUpperCase(),
          });

        if (attendanceError) {
          throw new Error(`Failed to record attendance: ${attendanceError.message}`);
        }

        setSuccess(`Attendance recorded for ${user.name || user.role}`);
        onScanSuccess?.(data.user_id);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Scan processing error:', errorMessage);
        setError(errorMessage);
        onScanError?.(errorMessage);
        setIsScanning(false);
      }
    };

    const onScanFailure = (error: string) => {
      // Only log errors that aren't common scanning issues
      if (!error.includes('No MultiFormat Readers') &&
        !error.includes('NotFoundException') &&
        !error.includes('No QR code found')) {
        console.warn('QR scan warning:', error);
      }
    };

    scannerRef.current.render(onScanSuccessHandler, onScanFailure);
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.clear();
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        QR Code Attendance Scanner
      </h2>

      {/* Scanner Container */}
      <div className="mb-6">
        <div id="qr-reader" className={`${isScanning ? 'block' : 'hidden'}`}></div>

        {!isScanning && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="text-gray-600">Click "Start Scanning" to begin</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Stop Scanning
          </button>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Error: {error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Success: {success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-medium mb-2">Instructions:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Allow camera access when prompted</li>
          <li>Hold the QR code steady within the frame</li>
          <li>Ensure good lighting conditions</li>
          <li>QR code should contain user_id data</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;