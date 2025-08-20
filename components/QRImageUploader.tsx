// "use client"
// import { useEffect, useRef, useState } from "react";
// import { Camera, Upload, X, CheckCircle } from "lucide-react";

// // Import the actual Html5Qrcode from html5-qrcode module
// import { Html5Qrcode } from "html5-qrcode";

// // Mock for demonstration - replace the above import when using

// export default function QRImageUploader() {
//   const [qrResult, setQrResult] = useState<string | null>(null);
//   const [isScanning, setIsScanning] = useState(false);
//   const [isDragOver, setIsDragOver] = useState(false);
//   const [scanMode, setScanMode] = useState<'upload' | 'camera'>('upload');
//   const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (!html5QrCodeRef.current) {
//       html5QrCodeRef.current = new Html5Qrcode("qr-reader");
//     }

//     return () => {
//       if (html5QrCodeRef.current) {
//         html5QrCodeRef.current.stop().catch(() => { });
//       }
//     };
//   }, []);

//   const startCameraScan = async () => {
//     if (!html5QrCodeRef.current) return;
//     setIsScanning(true);
//     setScanMode('camera');

//     try {
//       await html5QrCodeRef.current.start(
//         { facingMode: "environment" },
//         { fps: 30, qrbox: { width: 250, height: 250 } },
//         (decodedText) => {
//           setQrResult(decodedText);
//           console.log(decodedText);
//           setIsScanning(false);
//           html5QrCodeRef.current?.stop();
//         },
//         (errorMessage) => {
//           // Handle scan errors
//         }
//       );
//     } catch (err) {
//       setQrResult("❌ Failed to open camera: " + (err as any).message);
//       setIsScanning(false);
//     }
//   };

//   const stopCameraScan = async () => {
//     if (html5QrCodeRef.current) {
//       try {
//         await html5QrCodeRef.current.stop();
//         setIsScanning(false);
//       } catch (err) {
//         console.error("Error stopping camera:", err);
//       }
//     }
//   };

//   const handleFileSelect = async (file: File) => {
//     if (!file || !html5QrCodeRef.current) return;

//     try {
//       setIsScanning(true);
//       const result = await html5QrCodeRef.current.scanFile(file, true);
//       setQrResult(result);
//     } catch (err) {
//       setQrResult("❌ Failed to read QR from image: " + (err as any).message);
//     } finally {
//       setIsScanning(false);
//     }
//   };

//   const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       await handleFileSelect(file);
//     }
//   };

//   const handleDrop = async (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(false);

//     const files = Array.from(e.dataTransfer.files);
//     const imageFile = files.find(file => file.type.startsWith('image/'));

//     if (imageFile) {
//       await handleFileSelect(imageFile);
//     }
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(true);
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(false);
//   };

//   const resetScanner = () => {
//     setQrResult(null);
//     setScanMode('upload');
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
//       <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-2">
//             Upload Your QR Code
//           </h2>
//           <p className="text-sm text-gray-500">
//             Scan Your Brand Engagement With Images
//           </p>
//         </div>

//         {/* QR Scanner Display Area */}
//         {scanMode === 'camera' && isScanning && (
//           <div className="mb-6">
//             <div className="border-2 border-dashed border-blue-400 rounded-xl p-4 bg-blue-50">
//               <div
//                 id="qr-reader"
//                 className="w-full h-48 rounded-lg overflow-hidden border-2 border-blue-200 bg-white"
//                 style={{ minHeight: '192px' }}
//               />
//             </div>
//             <button
//               onClick={stopCameraScan}
//               className="mt-3 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
//             >
//               <X size={16} />
//               Stop Camera
//             </button>
//           </div>
//         )}

//         {/* Upload Area */}
//         {scanMode === 'upload' && (
//           <div
//             className={`border-2 border-dashed rounded-xl p-8 h-48 flex items-center justify-center text-center transition-all cursor-pointer ${isDragOver
//                 ? 'border-blue-400 bg-blue-50'
//                 : 'border-gray-300 hover:border-gray-400'
//               }`}
//             onDrop={handleDrop}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <div className="flex flex-col items-center gap-3">
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                 <Upload className="w-6 h-6 text-blue-600" />
//               </div>

//               <div>
//                 <p className="text-sm font-medium text-gray-700 mb-1">
//                   Click To Upload Or Drag And Drop
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   Max File Size: 5 MB
//                 </p>
//               </div>
//             </div>

//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               onChange={handleUpload}
//               className="hidden"
//             />
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex gap-3 mt-6">
//           <button
//             onClick={() => {
//               setScanMode('upload');
//               fileInputRef.current?.click();
//             }}
//             disabled={isScanning}
//             className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//           >
//             <Upload size={16} />
//             Upload Image
//           </button>

//           <button
//             onClick={startCameraScan}
//             disabled={isScanning}
//             className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//           >
//             <Camera size={16} />
//             Scan Camera
//           </button>
//         </div>

//         {/* Loading State */}
//         {isScanning && scanMode === 'upload' && (
//           <div className="mt-4 text-center">
//             <div className="inline-flex items-center gap-2 text-blue-600">
//               <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//               Processing QR code...
//             </div>
//           </div>
//         )}

//         {/* Result Display */}
//         {qrResult && (
//           <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//             <div className="flex items-start gap-3">
//               <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-gray-700 mb-1">
//                   QR Code Result:
//                 </p>
//                 <p className="text-sm text-gray-600 break-all">
//                   {qrResult}
//                 </p>
//               </div>
//               <button
//                 onClick={resetScanner}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Hidden QR Reader for camera mode */}
//         {scanMode !== 'camera' && (
//           <div id="qr-reader" className="hidden" />
//         )}

//         {/* Footer */}
//         <div className="text-center mt-6">
//           <p className="text-xs text-gray-400">
//             Powered by html5-qrcode
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }