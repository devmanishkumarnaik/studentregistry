import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Gmail address is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
        "Only Gmail addresses are accepted (e.g. name@gmail.com)",
      ],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [5, "Age must be at least 5"],
      max: [60, "Age cannot exceed 60"],
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },
    cgpa: {
      type: String,
      required: [true, "CGPA is required"],
      validate: {
        validator: (v) => {
          const n = parseFloat(v);
          return !isNaN(n) && n >= 0 && n <= 10.0;
        },
        message: "CGPA must be between 0.0 and 10.0",
      },
    },
  },
  { timestamps: true, versionKey: false }
);

const Student =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);
export default Student;
