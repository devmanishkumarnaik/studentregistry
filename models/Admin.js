import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    username:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    password:    { type: String, required: true, minlength: 6 },
    displayName: { type: String, default: "Admin" },
    lastLogin:   { type: Date },
  },
  { timestamps: true, versionKey: false }
);

// Hash password before saving to MongoDB
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to compare plain password with stored hash
AdminSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Prevent re-registration during Next.js hot-reload
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
export default Admin;
