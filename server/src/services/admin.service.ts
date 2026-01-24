import { UserModel } from "../models/user.model";
import { RequestModel } from "../models/request.model";
import { hashPassword } from "../utils/auth";
import { env } from "../config/env";

/**
 * Ensures an admin user exists and optionally creates a sample service request
 */
export const ensureAdminWithSampleRequest = async () => {
    const adminEmail = env.ADMIN_EMAIL || "admin@abelov.com";
    const adminPassword = env.ADMIN_PASSWORD || "admin123";

    let adminCreated = false;
    let requestCreated = false;

    // Check if admin exists
    let admin = await UserModel.findOne({ email: adminEmail });

    if (!admin) {
        // Create admin user
        const { salt, hash } = hashPassword(adminPassword);
        admin = await UserModel.create({
            email: adminEmail,
            password_hash: hash,
            password_salt: salt,
            roles: ["admin"],
            is_active: true,
        } as any);
        adminCreated = true;
        console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
        console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
    }

    // Check if there are any service requests
    const requestCount = await RequestModel.countDocuments();
    let sampleRequest = null;

    if (requestCount === 0) {
        // Create a sample service request
        sampleRequest = await RequestModel.create({
            shop_name: "Abelov Technical Records",
            technician_name: "Admin Technician",
            request_date: new Date().toISOString().slice(0, 10),
            customer_name: "",
            customer_phone: "+234-000-0000",
            customer_email: "john.doe@example.com",
            customer_address: "123 Main Street, Lagos",
            device_model: "MacBook Pro",
            device_brand: "Apple",
            serial_number: "C02ABC123XYZ",
            operating_system: "macOS Sonoma",
            accessories_received: "Charger, USB-C Cable",
            problem_description: "Screen flickering and battery not charging properly",
            diagnosis_date: new Date().toISOString().slice(0, 10),
            diagnosis_technician: "Admin Technician",
            fault_found: "Faulty display cable and battery connector",
            parts_used: "Display cable, Battery connector",
            repair_action: "Replaced display cable and battery connector. Tested thoroughly.",
            status: "Completed",
            service_charge: 15000,
            parts_cost: 25000,
            total_cost: 40000,
            deposit_paid: 20000,
            balance: 20000,
            payment_completed: false,
            user_id: admin.id,
        });
        requestCreated = true;
        console.log(`✅ Sample service request created`);
    }

    return {
        admin: admin.toJSON(),
        request: sampleRequest ? (sampleRequest as any).toJSON() : null,
        adminCreated,
        requestCreated,
    };
};
