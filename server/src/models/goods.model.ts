import mongoose, { Schema, model } from "mongoose";

const GoodsSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    category: { type: String, default: null },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

GoodsSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const GoodsModel = mongoose.models.goods || model("goods", GoodsSchema);
