// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import Admin from "@/models/Admin";

// export async function POST(request) {
//   try {
//     const { username, password } = await request.json();

//     if (!username?.trim() || !password?.trim()) {
//       return NextResponse.json(
//         { error: "Username and password are required" },
//         { status: 400 }
//       );
//     }

//     await connectDB();

//     // Auto-seed the admin account using env credentials on first run
//     const count = await Admin.countDocuments();
//     if (count === 0) {
//       const adminUsername    = process.env.ADMIN_USERNAME    || "admin";
//       const adminPassword    = process.env.ADMIN_PASSWORD    || "admin@123";
//       const adminDisplayName = process.env.ADMIN_DISPLAY_NAME || "Admin";
//       await new Admin({
//         username: adminUsername,
//         password: adminPassword,
//         displayName: adminDisplayName,
//       }).save();
//     }

//     const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
//     if (!admin) {
//       return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
//     }

//     const isMatch = await admin.comparePassword(password);
//     if (!isMatch) {
//       return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
//     }

//     await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

//     return NextResponse.json({
//       success: true,
//       user: { username: admin.username, displayName: admin.displayName },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return NextResponse.json(
//       { error: "Authentication failed. Please try again." },
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { username, password } = body;

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    await connectDB();

    const count = await Admin.countDocuments();
    if (count === 0) {
      const adminUsername    = process.env.ADMIN_USERNAME    || "admin";
      const adminPassword    = process.env.ADMIN_PASSWORD    || "admin@123";
      const adminDisplayName = process.env.ADMIN_DISPLAY_NAME || "Admin";
      await new Admin({ username: adminUsername, password: adminPassword, displayName: adminDisplayName }).save();
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    return NextResponse.json({
      success: true,
      user: { username: admin.username, displayName: admin.displayName },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 });
  }
}
