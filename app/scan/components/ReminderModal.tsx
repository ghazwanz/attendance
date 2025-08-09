"use client";

import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import React from "react";

interface NotificationModalProps {
    title?: string;
    message: string;
    isOpen: boolean;
    type: "piket_reminder" | "piket_out_reminder" | "clock_out_reminder" | string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

export default function ReminderModal({
    title = "Pemberitahuan",
    message,
    isOpen,
    onClose,
    onConfirm,
    confirmLabel = "Lanjut",
    cancelLabel = "Tutup",
    type
}: NotificationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="p-3">
                <div className="bg-white flex flex-col gap-5 items-center justify-center text-center dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
                    <Info width={60} height={60} />
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p>{message}</p>
                    </div>
                    <div className="flex justify-center gap-3">
                        {type !== "piket_reminder" &&
                            <Button
                                variant={"success"}
                                onClick={onConfirm}
                            >
                                {confirmLabel}
                            </Button>
                        }
                        <Button
                            variant={"destructive"}
                            onClick={onClose}
                        >
                            {cancelLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
