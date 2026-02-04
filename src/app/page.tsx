import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="w-28 h-28 bg-white rounded-3xl mb-8 flex items-center justify-center shadow-2xl">
        <svg
          className="w-16 h-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
          />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-white text-center mb-3">
        Biometric Demo
      </h1>
      <p className="text-blue-100 text-center mb-12 max-w-xs">
        Demo xác thực sinh trắc học cho ứng dụng di động
      </p>

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-4">
        <Link
          href="/login"
          className="block w-full py-4 bg-white text-blue-600 font-semibold rounded-xl text-center shadow-lg hover:bg-blue-50 transition-all active:scale-[0.98]"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="block w-full py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl text-center hover:bg-white/10 transition-all active:scale-[0.98]"
        >
          Đăng ký tài khoản
        </Link>
      </div>

      {/* Footer */}
      <p className="text-blue-200 text-sm mt-16">
        Version 1.0.0
      </p>
    </div>
  );
}
