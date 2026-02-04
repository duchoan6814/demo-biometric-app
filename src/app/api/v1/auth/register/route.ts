import { NextRequest, NextResponse } from "next/server";

// Mock database - in real app, this would be a real database
const mockUsers: Map<string, { id: string; email: string; password: string; name: string }> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          status: "error",
          message: "Vui lòng điền đầy đủ thông tin",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (mockUsers.has(email)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email đã được sử dụng",
        },
        { status: 409 }
      );
    }

    // Create new user
    const userId = `usr_${Date.now()}`;
    mockUsers.set(email, { id: userId, email, password, name });

    // Generate mock access token
    const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(
      JSON.stringify({ userId, email, exp: Date.now() + 3600000 })
    ).toString("base64")}`;

    return NextResponse.json(
      {
        status: "success",
        message: "Tạo tài khoản thành công",
        data: {
          access_token: accessToken,
          user_info: {
            id: userId,
            name: name,
          },
        },
      },
      { status: 201 }
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
