import { RequestModel } from "../models/request.model";

export const listRequests = async (filters: any = {}) => {
    const requests = await RequestModel.find(filters).sort({ created_at: -1 });
    return requests.map((r: any) => r.toJSON());
};

export const getRequestById = async (id: string) => {
    const request = await RequestModel.findById(id);
    if (!request) return null;
    return (request as any).toJSON();
};

export const createRequest = async (data: any) => {
    const request = new RequestModel(data);
    await request.save();
    return (request as any).toJSON();
};

export const updateRequest = async (id: string, updates: any) => {
    const request = await RequestModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    );
    if (!request) return null;
    return (request as any).toJSON();
};

export const deleteRequest = async (id: string) => {
    const result = await RequestModel.findByIdAndDelete(id);
    return !!result;
};

export const recordPayment = async (id: string, amount: number, reference?: string) => {
    const request = await RequestModel.findById(id);
    if (!request) return null;

    const currentDeposit = request.get("deposit_paid") || 0;
    const newDeposit = currentDeposit + amount;
    const totalCost = request.get("total_cost") || 0;
    const newBalance = totalCost - newDeposit;
    const paymentCompleted = newBalance <= 0;

    request.set("deposit_paid", newDeposit);
    request.set("balance", newBalance);
    request.set("payment_completed", paymentCompleted);

    await request.save();
    return (request as any).toJSON();
};
