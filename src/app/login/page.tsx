"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, loginWithBiometric, storage, getDeviceId } from "@/lib/api";
import { BiometricResultEventDetail } from "../../../types";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "test@example.com",
    password: "123456",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(formData.email, formData.password);

      if (response.status === "success" && response.data) {
        storage.setAccessToken(response.data.access_token);
        storage.setUserInfo(response.data.user_info);
        router.push("/settings");
      } else {
        setError(response.message || "Đăng nhập thất bại");
      }
    } catch {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    setError("");

    try {
      // TODO: Trigger biometric auth via WebView bridge and get biometric token
      const triggerBiometricEvent = new CustomEvent("TRIGGER_BIOMETRIC");

      window.dispatchEvent(triggerBiometricEvent);
    } catch {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setBiometricLoading(false);
    }
  };

  useEffect(() => {
    const handleBiometricEvent = async (event: Event) => {
      const customEvent = event as CustomEvent<BiometricResultEventDetail>;
      const { status, message, biometric_token } = customEvent.detail;

      if (status === "success" && biometric_token) {
        const deviceId = getDeviceId();
        if (!biometric_token) {
          setError("Chưa đăng ký sinh trắc học");
          return;
        }
        // In real app, this would trigger native biometric prompt via WebView bridge
        // For demo, we simulate successful biometric verification
        const response = await loginWithBiometric(biometric_token, deviceId);
        if (response.status === "success" && response.data) {
          storage.setAccessToken(response.data.access_token);
          storage.setUserInfo(response.data.user_info);
          router.push("/settings");
        } else {
          setError(response.message || "Xác thực sinh trắc học thất bại");
        }
      } else {
        setError(message || "Xác thực sinh trắc học thất bại");
      }
    };

    window.addEventListener("BIOMETRIC_RESULT", handleBiometricEvent);

    return () => {
      window.removeEventListener("BIOMETRIC_RESULT", handleBiometricEvent);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="pt-16 pb-10 px-6 text-center">
        <div className="w-24 h-24 bg-blue-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg
            className="w-12 h-12 text-white"
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Chào mừng trở lại
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Đăng nhập để tiếp tục
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <a href="#" className="text-sm text-blue-500 hover:text-blue-600">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:active:scale-100"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">
            hoặc
          </span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Biometric Login Button */}
        <button
          type="button"
          onClick={handleBiometricLogin}
          disabled={biometricLoading}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-green-300 disabled:to-emerald-300 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center gap-3"
        >
          <svg
            className="w-6 h-6"
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
          {biometricLoading
            ? "Đang xác thực..."
            : "Đăng nhập bằng sinh trắc học"}
        </button>

        {/* Register Link */}
        <div className="mt-8 text-center pb-8">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-blue-500 font-semibold hover:text-blue-600"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
