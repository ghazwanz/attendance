import React from 'react';

function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-400 px-4">

      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* Bagian Kiri - Logo */}
        <div className="w-1/2 bg-gray-900 text-white flex flex-col items-center justify-center p-10">
          
            <img src="../../logo.png" alt="Logo" className="object-contain" />
        </div>

        {/* Bagian Kanan - Form */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-sm text-gray-500 mb-4">
            Belum punya akun ? <a href="#" className="text-blue-600 hover:underline">Register disini !</a>
          </p>

          <form className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Nom d'utilisateur"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200"
              >
                Submit
              </button>
            </div>
          </form>

          
        </div>
      </div>
    </div>
  );
}

export default page;
