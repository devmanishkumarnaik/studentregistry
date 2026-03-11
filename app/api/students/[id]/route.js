// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import Student from "@/models/Student";

// export async function GET(request, { params }) {
//   try {
//     await connectDB();
//     const student = await Student.findById(params.id).lean();
//     if (!student)
//       return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
//     return NextResponse.json({ success: true, data: { ...student, _id: student._id.toString() } });
//   } catch {
//     return NextResponse.json({ success: false, error: "Failed to fetch student" }, { status: 500 });
//   }
// }

// export async function PUT(request, { params }) {
//   try {
//     await connectDB();
//     const { name, email, age, course, cgpa } = await request.json();

//     const dup = await Student.findOne({ email: email?.toLowerCase().trim(), _id: { $ne: params.id } });
//     if (dup)
//       return NextResponse.json(
//         { success: false, error: "This email is already used by another student" },
//         { status: 409 }
//       );

//     const student = await Student.findByIdAndUpdate(
//       params.id,
//       { name, email, age: Number(age), course, cgpa },
//       { new: true, runValidators: true }
//     ).lean();

//     if (!student)
//       return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });

//     return NextResponse.json({ success: true, data: { ...student, _id: student._id.toString() } });
//   } catch (error) {
//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((e) => e.message);
//       return NextResponse.json({ success: false, error: messages.join(", ") }, { status: 400 });
//     }
//     return NextResponse.json({ success: false, error: "Failed to update student" }, { status: 500 });
//   }
// }

// export async function DELETE(request, { params }) {
//   try {
//     await connectDB();
//     const student = await Student.findByIdAndDelete(params.id);
//     if (!student)
//       return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
//     return NextResponse.json({
//       success: true,
//       message: `${student.name} has been deleted`,
//       deletedId: params.id,
//     });
//   } catch {
//     return NextResponse.json({ success: false, error: "Failed to delete student" }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

// Required on Vercel — prevents static caching, enables PUT/DELETE methods
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const student = await Student.findById(id).lean();
    if (!student)
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: { ...student, _id: student._id.toString() } });
  } catch (err) {
    console.error("GET student error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch student" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const { id } = await params;
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

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const student = await Student.findByIdAndDelete(id);
    if (!student)
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: `${student.name} has been deleted`, deletedId: id });
  } catch (err) {
    console.error("DELETE student error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete student" }, { status: 500 });
  }
}

