"use client";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function UploadCard({ onFileSelect, disabled }: UploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = Array.from(e.dataTransfer.files).find((f) =>
      f.type.startsWith("image/")
    );
    if (file) onFileSelect(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 h-48 flex items-center justify-center text-center transition-all cursor-pointer 
        ${
          isDragOver
            ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
        } 
        bg-white dark:bg-gray-900`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Klik untuk mengunggah atau seret dan lepas file gambar
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Max File Size: 15 MB
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}
