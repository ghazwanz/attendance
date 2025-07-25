import React from "react";
import { FormLoginBanner } from "@/components/FormLoginBanner";
import { FormSignUp } from "@/components/FormRegister";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden font-sans">

      {/* KIRI - ILUSTRASI YANG DIPERCANTIK */}
      <FormLoginBanner />

      {/* KANAN - FORM LOGIN */}
      <FormSignUp />

      {/* ANIMASI LATAR GLOKAL */}
      {/* <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-700 rounded-full blur-3xl opacity-30 animate-pulse -z-10" /> */}
      {/* <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse -z-10" /> */}
    </div>
  );
}
