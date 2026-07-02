import mongoose, { Schema, model } from "mongoose";

const RequestSchema = new Schema(
  {
    shop_name: { type: String },
    technician_name: { type: String },
    request_date: { type: String },
    customer_name: { type: String, index: true },
    customer_phone: { type: String, index: true },
    customer_email: { type: String, index: true },
    customer_address: { type: String },
    device_model: { type: String },
    device_brand: { type: String },
    serial_number: { type: String, index: true },
    operating_system: { type: String },
    accessories_received: { type: String },
    problem_description: { type: String },
    diagnosis_date: { type: String },
    diagnosis_technician: { type: String },
    fault_found: { type: String },
    parts_used: { type: String },
    repair_action: { type: String },
    status: { type: String, index: true },
    service_charge: { type: Number },
    parts_cost: { type: Number },
    total_cost: { type: Number },
    deposit_paid: { type: Number },
    balance: { type: Number },
    payment_completed: { type: Boolean },
    payment_status: { type: String, enum: ["unpaid", "partial", "paid"], default: "unpaid" },
    department: { type: String, default: "" },
    user_id: { type: String, index: true },
    assigned_to: { type: String, index: true, default: null },
    assigned_by: { type: String, default: null },
    assigned_at: { type: String, default: null },
    accepted_at: { type: String, default: null },
    delivered_at: { type: String, default: null },
    delivered: { type: Boolean, default: false },
    technician_notes: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

RequestSchema.index({ status: 1, created_at: -1 });

// No encryption - store data as plain text
RequestSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export type RequestDoc = mongoose.Document & {
  shop_name: string;
};

export const RequestModel = mongoose.models.requests || model("requests", RequestSchema);
