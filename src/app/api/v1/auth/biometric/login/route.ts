import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { biometric_token, device_id } = body;

    // Validation
    if (!biometric_token || !device_id) {
      return NextResponse.json(
        {
          status: "error",
          message: "Thiếu thông tin xác thực sinh trắc học",
        },
        { status: 400 }
      );
    }

    // Mock validation - check if biometric_token starts with "bio_"
    // In real app, this would verify against stored tokens in database
    if (!biometric_token.startsWith("bio_")) {
      return NextResponse.json(
        {
          status: "error",
          message: "Token sinh trắc học không hợp lệ",
        },
        { status: 401 }
      );
    }

    // Extract user ID from biometric token (mock format: bio_<userId>_<timestamp>_<random>)
    const tokenParts = biometric_token.split("_");
    const userId = tokenParts[1] || "usr_demo";

    // For demo purposes, simulate successful biometric login
    // Generate new access token
    const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(
      JSON.stringify({ 
        userId, 
        biometricAuth: true,
        exp: Date.now() + 3600000 
      })
    ).toString("base64")}`;

    return NextResponse.json(
      {
        status: "success",
        data: {
          access_token: accessToken,
          user_info: {
            id: userId,
            name: "Biometric User",
          },
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
