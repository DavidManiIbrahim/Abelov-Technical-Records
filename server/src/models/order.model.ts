import mongoose, { Schema, model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    goods_id: { type: String },
    name: { type: String },
    quantity: { type: Number },
    price: { type: Number },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    customer_name: { type: String, required: true },
    status: { type: String, default: "pending" },
    total_amount: { type: Number, required: true },
    items: { type: [OrderItemSchema], default: [] },
    payment_status: { type: String, default: "unpaid" },
    order_date: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

OrderSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const OrderModel = mongoose.models.orders || model("orders", OrderSchema);
