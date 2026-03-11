import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    let query = {};
    if (search) {
      const regex = new RegExp(search, "i");
      query = { $or: [{ name: regex }, { email: regex }, { course: regex }] };
    }

    const students = await Student.find(query).sort({ createdAt: -1 }).lean();
    const data = students.map(({ _id, ...rest }) => ({ _id: _id.toString(), ...rest }));

    return NextResponse.json({ success: true, data, count: data.length });
  } catch (error) {
    console.error("GET /api/students:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, age, course, cgpa } = await request.json();

    const existing = await Student.findOne({ email: email?.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A student with this email already exists" },
        { status: 409 }
      );
    }

    const student = await Student.create({ name, email, age: Number(age), course, cgpa });
    return NextResponse.json(
      { success: true, data: { ...student.toObject(), _id: student._id.toString() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/students:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json({ success: false, error: messages.join(", ") }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to create student" }, { status: 500 });
  }
}
