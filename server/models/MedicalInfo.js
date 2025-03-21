const mongoose = require('mongoose');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Define the schema
const medicalInfoSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    bloodType: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    allergies: [{
        type: String,
        trim: true
    }],
    medications: [{
        name: { type: String, required: true, trim: true },
        dosage: { type: String, trim: true },
        frequency: { type: String, trim: true }
    }],
    conditions: [{
        type: String,
        trim: true
    }],
    emergencyContact: {
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        phone: { type: String, trim: true }
    },
    insuranceInfo: {
        provider: { type: String, trim: true },
        policyNumber: { type: String, trim: true },
        groupNumber: { type: String, trim: true }
    },
    qrCode: String,
    accessLog: [{
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        accessTime: {
            type: Date,
            default: Date.now
        },
        action: String
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

medicalInfoSchema.pre('save', function(next) {
    // Clean arrays
    if (this.allergies) {
        this.allergies = this.allergies.filter(allergy => allergy && allergy.trim());
    }
    if (this.medications) {
        this.medications = this.medications.filter(med => med && med.name && med.name.trim());
    }
    if (this.conditions) {
        this.conditions = this.conditions.filter(condition => condition && condition.trim());
    }

    this.lastUpdated = new Date();

    next();
});

// Function to generate secure access token
function generateAccessToken(medicalInfo) {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
    const token = jwt.sign({
        type: 'medical_access',
        medicalInfoId: medicalInfo._id.toString(),
        patientId: medicalInfo.patient.toString(),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hour expiration
    }, JWT_SECRET);
    return token;
}

// Function to encrypt medical data
function encryptData(data) {
    try {
        const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-32-chars-long!!!!!';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
        
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
        encrypted += cipher.final('base64');
        
        const authTag = cipher.getAuthTag();
        
        return {
            iv: iv.toString('base64'),
            data: encrypted,
            auth: authTag.toString('base64')
        };
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
}

// Generate QR code before saving
medicalInfoSchema.pre('save', async function(next) {
    try {
        // Generate QR code with essential medical info
        const qrData = {
            __v: 4,
            id: this._id.toString(),
            name: this.name,
            bloodType: this.bloodType,
            allergies: this.allergies || [],
            medications: this.medications.map(med => ({
                name: med.name,
                dosage: med.dosage || '',
                frequency: med.frequency || ''
            })),
            conditions: this.conditions || [],
            emergencyContact: {
                name: this.emergencyContact?.name || '',
                relationship: this.emergencyContact?.relationship || '',
                phone: this.emergencyContact?.phone || ''
            },
            lastUpdated: this.lastUpdated || new Date()
        };
        
        // Convert to JSON string with consistent formatting
        const qrString = JSON.stringify(qrData);
        
        // Generate QR code
        this.qrCode = await QRCode.toDataURL(qrString, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 400,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        
        next();
    } catch (error) {
        console.error('Error generating QR code:', error);
        next(error);
    }
});

// Method to log access
medicalInfoSchema.methods.logAccess = async function(staffId, action) {
    this.accessLog.push({
        staffId,
        action,
        accessTime: new Date()
    });
    return this.save();
};

// Method to check if user has access
medicalInfoSchema.methods.hasAccess = function(user) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'doctor' || user.role === 'nurse') {
        return true; // Add additional checks if needed
    }
    return user._id.toString() === this.patient.toString();
};

// Add a method to transform the document for JSON responses
medicalInfoSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.accessLog; // Don't expose access logs in regular responses
    return obj;
};

// Create the model
const MedicalInfo = mongoose.model('MedicalInfo', medicalInfoSchema);

// Create indexes
MedicalInfo.init().then(() => {
    console.log('MedicalInfo model initialized');
    return Promise.all([
        MedicalInfo.collection.createIndex({ patient: 1 }, { 
            unique: true,
            background: true,
            name: 'patient_unique_index'
        }),
        MedicalInfo.collection.createIndex({ 'accessLog.accessTime': 1 }, {
            background: true,
            name: 'access_log_time_index'
        })
    ]);
}).catch(err => {
    if (err.code !== 86) { // Ignore index exists error
        console.error('Error creating indexes:', err);
    }
});

module.exports = MedicalInfo; 