import mongoose, { Schema, model } from "mongoose";

const PurchaseItemSchema = new Schema(
  {
    goods_id: { type: String },
    name: { type: String },
    quantity: { type: Number },
    price: { type: Number },
  },
  { _id: false }
);

const PurchaseSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    supplier: { type: String, required: true },
    status: { type: String, default: "pending" },
    total_amount: { type: Number, required: true },
    items: { type: [PurchaseItemSchema], default: [] },
    purchase_date: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

PurchaseSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const PurchaseModel = mongoose.models.purchases || model("purchases", PurchaseSchema);
