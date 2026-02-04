import { NextRequest, NextResponse } from "next/server";

// Mock biometric token storage
// In real app, this would be stored in database with user association
const biometricTokens: Map<string, { userId: string; deviceId: string; deviceName: string }> = new Map();

export async function POST(request: NextRequest) {
  try {
    // Check authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized - Token không hợp lệ",
        },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");
    
    // Mock token validation - extract user info from token
    let userId: string;
    try {
      const tokenParts = accessToken.split(".");
      if (tokenParts.length >= 2) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
        userId = payload.userId;
      } else {
        throw new Error("Invalid token format");
      }
    } catch {
      return NextResponse.json(
        {
          status: "error",
          message: "Token không hợp lệ hoặc đã hết hạn",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { device_name, device_id } = body;

    // Validation
    if (!device_id) {
      return NextResponse.json(
        {
          status: "error",
          message: "Thiếu thông tin thiết bị",
        },
        { status: 400 }
      );
    }

    // Generate biometric token
    const biometricToken = `bio_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    // Store the association
    biometricTokens.set(biometricToken, {
      userId,
      deviceId: device_id,
      deviceName: device_name || "Unknown Device",
    });

    // Also export for use by login endpoint
    if (typeof global !== "undefined") {
      (global as Record<string, unknown>).biometricTokens = biometricTokens;
    }

    return NextResponse.json(
      {
        status: "success",
        data: {
          biometric_token: biometricToken,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Đã có lỗi xảy ra",
      },
      { status: 500 }
    );
  }
}
