// API client utilities for the biometric demo app

const API_BASE = "/api/v1";

interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

interface UserInfo {
  id: string;
  name: string;
}

interface AuthData {
  access_token: string;
  user_info: UserInfo;
}

interface BiometricEnrollData {
  biometric_token: string;
}

// Register new user
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<ApiResponse<AuthData>> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name }),
  });

  return response.json();
}

// Login with email/password
export async function loginUser(
  email: string,
  password: string
): Promise<ApiResponse<AuthData>> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}

// Enroll biometric (register device for biometric login)
export async function enrollBiometric(
  accessToken: string,
  deviceId: string,
  deviceName?: string
): Promise<ApiResponse<BiometricEnrollData>> {
  const response = await fetch(`${API_BASE}/auth/biometric/enroll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      device_id: deviceId,
      device_name: deviceName || "Unknown Device",
    }),
  });

  return response.json();
}

// Login with biometric token
export async function loginWithBiometric(
  biometricToken: string,
  deviceId: string
): Promise<ApiResponse<AuthData>> {
  const response = await fetch(`${API_BASE}/auth/biometric/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      biometric_token: biometricToken,
      device_id: deviceId,
    }),
  });

  return response.json();
}

// Storage helpers
export const storage = {
  getAccessToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },

  setAccessToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("access_token", token);
  },

  removeAccessToken: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
  },

  getUserInfo: (): UserInfo | null => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("user_info");
    return data ? JSON.parse(data) : null;
  },

  setUserInfo: (userInfo: UserInfo) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("user_info", JSON.stringify(userInfo));
  },

  removeUserInfo: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user_info");
  },

  getBiometricToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("biometric_token");
  },

  setBiometricToken: (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("biometric_token", token);
  },

  removeBiometricToken: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("biometric_token");
  },

  isBiometricEnabled: () => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("biometric_enabled") === "true";
  },

  setBiometricEnabled: (enabled: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("biometric_enabled", enabled ? "true" : "false");
  },

  clearAll: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    localStorage.removeItem("biometric_token");
    localStorage.removeItem("biometric_enabled");
  },
};

// Generate a unique device ID (mock implementation)
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";

  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}
