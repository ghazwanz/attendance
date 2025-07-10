import React from 'react';

function ProfileForm() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personal Information</h2>

        <form className="space-y-5">
          {/* Name */}
          <div>
  {/* Name */}
  <div>
    <label
      htmlFor="name"
      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      Name
    </label>
    <input
      type="text"
      id="name"
      placeholder="Your full name"
      className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
    />
  </div>

  {/* Email */}
  <div>
    <label
      htmlFor="email"
      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      Email
    </label>
    <input
      type="email"
      id="email"
      placeholder="your@email.com"
      className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
    />
  </div>

  {/* Password */}
  <div>
    <label
      htmlFor="password"
      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      Password
    </label>
    <input
      type="password"
      id="password"
      placeholder="********"
      className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
    />
  </div>
</div>


          {/* Button */}
          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Save Information
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;