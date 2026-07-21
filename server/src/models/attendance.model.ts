import mongoose, { Schema, model } from "mongoose";

const AttendanceSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    clock_in: { type: String, default: null },
    clock_out: { type: String, default: null },
    duration_minutes: { type: Number, default: null },
    status: { type: String, enum: ["present", "late", "absent", "half_day"], default: "present" },
    notes: { type: String, default: "" },
    face_image: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

AttendanceSchema.index({ user_id: 1, date: 1 }, { unique: true });

AttendanceSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const AttendanceModel = mongoose.models.attendance || model("attendance", AttendanceSchema);
