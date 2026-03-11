// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import Admin from "@/models/Admin";

// export async function POST() {
//   try {
//     await connectDB();

//     const adminUsername    = process.env.ADMIN_USERNAME    || "admin";
//     const adminPassword    = process.env.ADMIN_PASSWORD    || "admin@123";
//     const adminDisplayName = process.env.ADMIN_DISPLAY_NAME || "Admin";

//     const existing = await Admin.findOne({ username: adminUsername });
//     if (existing) {
//       return NextResponse.json({ message: "Admin already exists" }, { status: 200 });
//     }

//     await new Admin({
//       username: adminUsername,
//       password: adminPassword,
//       displayName: adminDisplayName,
//     }).save();

//     return NextResponse.json({ message: "Admin seeded successfully" }, { status: 201 });
//   } catch (error) {
//     console.error("Seed error:", error);
//     return NextResponse.json({ error: "Seed failed" }, { status: 500 });
//   }
// }





import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectDB();

    const adminUsername    = process.env.ADMIN_USERNAME    || "admin";
    const adminPassword    = process.env.ADMIN_PASSWORD    || "admin@123";
    const adminDisplayName = process.env.ADMIN_DISPLAY_NAME || "Admin";

    const existing = await Admin.findOne({ username: adminUsername });
    if (existing) {
      return NextResponse.json({ message: "Admin already exists" }, { status: 200 });
    }

    await new Admin({
      username: adminUsername,
      password: adminPassword,
      displayName: adminDisplayName,
    }).save();

    return NextResponse.json({ message: "Admin seeded successfully" }, { status: 201 });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
