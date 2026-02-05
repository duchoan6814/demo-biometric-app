"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { enrollBiometric, storage, getDeviceId } from "@/lib/api";

interface BiometricEventDetail {
  biometric_token?: string; // Khi người dùng bật sinh trắc học thì chuyền token lên cho APP để lưu lại
}

interface BiometricResultEventDetail {
  status: "success" | "failure";
  message?: string;
  biometric_token?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Người dùng");
  const [userEmail, setUserEmail] = useState("user@example.com");

  useEffect(() => {
    // Check login status
    const token = storage.getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // Load user info
    const userInfo = storage.getUserInfo();
    if (userInfo) {
      setUserName(userInfo.name);
      setUserEmail(`${userInfo.name}@example.com`);
    }

    // Load biometric status
    setBiometricEnabled(storage.isBiometricEnabled());
  }, [router]);

  const handleToggleBiometric = async () => {
    const newState = !biometricEnabled;
    setLoading(true);

    try {
      if (newState) {
        // Enable biometric - call enroll API
        const accessToken = storage.getAccessToken();
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const deviceId = getDeviceId();
        const response = await enrollBiometric(
          accessToken,
          deviceId,
          "Web Browser",
        );
        console.log("🚀 ~ handleToggleBiometric ~ response:", response);

        // TODO: dispatch event to app
        const triggerBiometricEvent = new CustomEvent("TRIGGER_BIOMETRIC", {
          detail: {
            biometric_token: response?.data?.biometric_token,
          } as BiometricEventDetail,
        });

        window.dispatchEvent(triggerBiometricEvent);

        // if (response.status === "success" && response.data) {
        //   storage.setBiometricToken(response.data.biometric_token);
        //   storage.setBiometricEnabled(true);
        //   setBiometricEnabled(true);
        //   alert("Đã bật xác thực sinh trắc học thành công!");
        // } else {
        //   alert("Không thể bật sinh trắc học. Vui lòng thử lại.");
        // }
      } else {
        // Disable biometric - remove local token
        storage.removeBiometricToken();
        storage.setBiometricEnabled(false);
        setBiometricEnabled(false);
        alert("Đã tắt xác thực sinh trắc học");
      }
    } catch {
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearAll();
    router.push("/login");
  };

  useEffect(() => {
    const handleBiometricEvent = (event: Event) => {
      const customEvent = event as CustomEvent<BiometricResultEventDetail>;
      const { status, message, biometric_token } = customEvent.detail;

      if (status === "success" && biometric_token) {
        storage.setBiometricToken(biometric_token);
        storage.setBiometricEnabled(true);
        setBiometricEnabled(true);
        alert(message || "Đã bật xác thực sinh trắc học thành công!");
      } else {
        alert(message || "Xác thực sinh trắc học thất bại");
      }
    };

    window.addEventListener("BIOMETRIC_RESULT", handleBiometricEvent);

    return () => {
      window.removeEventListener("BIOMETRIC_RESULT", handleBiometricEvent);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cài đặt
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Quản lý tài khoản và bảo mật
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="p-5 flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {userName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">
            Bảo mật
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Biometric Toggle */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
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
                <div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                    Sinh trắc học
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sử dụng vân tay hoặc Face ID để đăng nhập
                  </p>
                </div>
              </div>
              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleBiometric}
                disabled={loading}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
                  biometricEnabled
                    ? "bg-green-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    biometricEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-700" />

            {/* Change Password */}
            <button className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                    Đổi mật khẩu
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cập nhật mật khẩu tài khoản
                  </p>
                </div>
              </div>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">
            Thông tin
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <span className="text-gray-900 dark:text-white">Phiên bản</span>
              <span className="text-gray-500 dark:text-gray-400">1.0.0</span>
            </div>
          </div>
        </div>

        {/* Spacer to push logout button to bottom */}
        <div className="flex-1 min-h-[100px]" />
      </div>

      {/* Logout Button - Fixed at bottom */}
      <div className="px-4 pb-8 pt-4">
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
