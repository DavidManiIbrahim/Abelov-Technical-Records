import mongoose, { Schema, model } from "mongoose";

const AcademySchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: null },
    instructor: { type: String, default: "" },
    duration: { type: String, default: "" },
    price: { type: Number, default: 0 },
    level: { type: String, enum: ["beginner", "intermediate", "advanced", ""], default: "" },
    syllabus: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

AcademySchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const AcademyModel = mongoose.models.academy || model("academy", AcademySchema);
