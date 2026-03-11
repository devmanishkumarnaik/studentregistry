import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Allow": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request, context) {
  try {
    await connectDB();
    const id = context.params.id;
    const student = await Student.findById(id).lean();
    if (!student)
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: { ...student, _id: student._id.toString() } });
  } catch (err) {
    console.error("GET student error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch student" }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const id = context.params.id;
    const { name, email, age, course, cgpa } = body;

    const dup = await Student.findOne({
      email: email?.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (dup) {
      return NextResponse.json(
        { success: false, error: "This email is already used by another student" },
        { status: 409 }
      );
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { name, email: email?.toLowerCase().trim(), age: Number(age), course, cgpa },
      { new: true, runValidators: true }
    ).lean();

    if (!student)
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: { ...student, _id: student._id.toString() } });
  } catch (error) {
    console.error("PUT student error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json({ success: false, error: messages.join(", ") }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    await connectDB();
    const id = context.params.id;
    const student = await Student.findByIdAndDelete(id);
    if (!student)
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    return NextResponse.json({
      success: true,
      message: `${student.name} has been deleted`,
      deletedId: id,
    });
  } catch (err) {
    console.error("DELETE student error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete student" }, { status: 500 });
  }
}
