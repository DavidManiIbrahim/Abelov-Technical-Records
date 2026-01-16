
import mongoose from 'mongoose';
import { RequestModel } from '../models/request.model';
import { env } from '../config/env';

// List of valid technician names
const VALID_TECHNICIANS = [
    'Godwin Elkana',
    'Emmanuel Daniel',
    'Douglas Noku',
    'Boss Abel',
];

// Helper to normalize a name
const normalizeName = (name: string | undefined): string | undefined => {
    if (!name) return name;

    // If exact match, return it
    if (VALID_TECHNICIANS.includes(name)) return name;

    const lowerName = name.toLowerCase();

    // Keyword matching
    if (lowerName.includes('godwin') || lowerName.includes('elkana')) {
        return 'Godwin Elkana';
    }
    if (lowerName.includes('emmanuel') || lowerName.includes('umar')) {
        return 'Emmanuel Daniel';
    }
    if (lowerName.includes('douglas') || lowerName.includes('noku')) {
        return 'Douglas Noku';
    }
    if (lowerName.includes('boss') || lowerName.includes('abel')) {
        return 'Boss Abel';
    }

    // If no match found, keep original or return a default (keeping original for safety)
    return name;
};

const runMigration = async () => {
    try {
        console.log('Connecting to database...');
        // Ensure we use the connection string from env or default
        const mongoUri = env.MONGODB_URI;
        console.log(`Connecting to: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB.');

        const requests = await RequestModel.find({});
        console.log(`Found ${requests.length} requests to check.`);

        let updatedCount = 0;

        for (const request of requests) {
            let isModified = false;
            const original = {
                tech: request.technician_name,
                diag: request.diagnosis_technician,
                conf: request.customer_confirmation?.technician
            };

            // 1. Check Shop Technician Name
            const normalizedTech = normalizeName(request.technician_name);
            if (normalizedTech && normalizedTech !== request.technician_name) {
                request.technician_name = normalizedTech;
                isModified = true;
            }

            // 2. Check Diagnosis Technician
            const normalizedDiag = normalizeName(request.diagnosis_technician);
            if (normalizedDiag && normalizedDiag !== request.diagnosis_technician) {
                request.diagnosis_technician = normalizedDiag;
                isModified = true;
            }

            // 3. Check Confirmation Technician
            if (request.customer_confirmation?.technician) {
                const normalizedConf = normalizeName(request.customer_confirmation.technician);
                if (normalizedConf && normalizedConf !== request.customer_confirmation.technician) {
                    // Need to update the nested object carefully or just assign it
                    // Mongoose detects subdocument changes usually
                    request.customer_confirmation.technician = normalizedConf;
                    // Mark modified for mixed types/subdocs if needed, but here it's typed
                    request.markModified('customer_confirmation');
                    isModified = true;
                }
            }

            if (isModified) {
                await request.save();
                updatedCount++;
                console.log(`Updated Request ID: ${request.id}`);
                if (original.tech !== request.technician_name) console.log(`  - Tech: "${original.tech}" -> "${request.technician_name}"`);
                if (original.diag !== request.diagnosis_technician) console.log(`  - Diag: "${original.diag}" -> "${request.diagnosis_technician}"`);
                if (original.conf !== request.customer_confirmation?.technician) console.log(`  - Conf: "${original.conf}" -> "${request.customer_confirmation?.technician}"`);
            }
        }

        console.log('------------------------------------------------');
        console.log(`Migration complete. Updated ${updatedCount} documents.`);

        await mongoose.disconnect();
        console.log('Disconnected from database.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
