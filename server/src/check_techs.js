
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const RequestSchema = new mongoose.Schema({
    technician_name: String,
    diagnosis_technician: String,
    customer_confirmation: {
        technician: String
    }
}, { strict: false });

// Use existing model if available to avoid OverwriteModelError, though in a standalone script it shouldn't matter.
const RequestModel = mongoose.models.requests || mongoose.model('requests', RequestSchema);

const run = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/abelov_records';
        console.log('Connecting to DB...');

        await mongoose.connect(mongoUri);
        console.log('Connected successfully.');

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
        console.log('Done.');
    } catch (error) {
        console.error('Error:', error);
    }
};

run();
