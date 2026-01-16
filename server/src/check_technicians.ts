
import mongoose from 'mongoose';
import { RequestModel } from '../models/request.model'; // Adjust path if needed
import { env } from '../config/env';

const run = async () => {
    try {
        await mongoose.connect(env.MONGO_URI || 'mongodb://localhost:27017/abelov_records');
        console.log('Connected to DB');

        const technicians = await RequestModel.distinct('technician_name');
        const diagnosisTechnicians = await RequestModel.distinct('diagnosis_technician');
        const confirmationTechnicians = await RequestModel.distinct('customer_confirmation.technician');

        console.log('--- Unique Technician Names (Shop Info) ---');
        console.log(technicians);

        console.log('\n--- Unique Diagnosis Technicians ---');
        console.log(diagnosisTechnicians);

        console.log('\n--- Unique Confirmation Technicians ---');
        console.log(confirmationTechnicians);

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

run();
