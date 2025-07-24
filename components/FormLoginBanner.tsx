import Image from "next/image"

export const FormLoginBanner = () => {
    return (
        <div className="hidden md:flex w-1/2 items-center justify-center relative bg-gradient-to-br from-[#1e1e2f] via-[#23233b] to-[#1e1e2f] overflow-hidden">
            {/* Logo */}
            <Image
                src="/logo1.png"
                alt="MAHATIVE Logo"
                className="absolute top-8 left-8 w-14 drop-shadow-md z-10"
                width={56}
                height={56}
            />

            {/* Efek Lingkaran Latar */}
            <div className="absolute -top-16 -left-16 w-96 h-96 bg-indigo-700 rounded-full opacity-20 blur-3xl z-0 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-2xl z-0 animate-pulse" />

            {/* Ilustrasi & Teks */}
            <div className="relative z-10 flex flex-col items-center text-center animate-fade-in-up">
                <Image
                    src="https://siprakerin.com/assets/images/auth/login.svg"
                    alt="Login Illustration"
                    className="w-[320px] drop-shadow-2xl select-none transition-transform hover:scale-105 duration-300"
                    width={320}
                    height={320}
                />
                <p className="text-zinc-200 text-sm mt-6 px-6">
                    Masuk dengan aman dan nyaman 🚀<br />
                    Lindungi datamu, tetap produktif!
                </p>
            </div>
        </div>
    )
}