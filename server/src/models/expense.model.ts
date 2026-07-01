import mongoose, { Schema, model } from "mongoose";

const ExpenseSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    amount: { type: Number, required: true },
    vendor: { type: String, default: null },
    date: { type: String },
    is_recurring: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

ExpenseSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const ExpenseModel = mongoose.models.expenses || model("expenses", ExpenseSchema);
