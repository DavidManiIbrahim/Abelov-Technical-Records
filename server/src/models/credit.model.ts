import mongoose, { Schema, model } from "mongoose";

const CreditSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    customer_name: { type: String, required: true },
    status: { type: String, default: "active" },
    amount: { type: Number, required: true },
    used_amount: { type: Number, default: 0 },
    issued_date: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

CreditSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const CreditModel = mongoose.models.credits || model("credits", CreditSchema);
