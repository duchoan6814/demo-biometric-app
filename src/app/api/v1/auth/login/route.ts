import { NextRequest, NextResponse } from "next/server";

// Mock users - for demo purposes, any email with password "123456" will work
const DEMO_PASSWORD = "123456";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          status: "error",
          message: "Vui lòng nhập email và mật khẩu",
        },
        { status: 400 }
      );
    }

    // Mock authentication - accept any email with demo password
    if (password !== DEMO_PASSWORD) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email hoặc mật khẩu không đúng",
        },
        { status: 401 }
      );
    }

    // Generate mock user data
    const userId = `usr_${Buffer.from(email).toString("base64").slice(0, 8)}`;
    const userName = email.split("@")[0];

    // Generate mock access token
    const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(
      JSON.stringify({ userId, email, exp: Date.now() + 3600000 })
    ).toString("base64")}`;

    return NextResponse.json(
      {
        status: "success",
        data: {
          access_token: accessToken,
          user_info: {
            id: userId,
            name: userName,
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
