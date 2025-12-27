const mongoose = require('mongoose');

/**
 * CommunicationAudit Schema
 * 
 * Tracks all outbound communications (email, WhatsApp OTP) for audit purposes.
 * This model stores metadata about communication attempts without logging sensitive data.
 * 
 * Design Decisions:
 * - Uses MongoDB for consistency with existing models
 * - Indexed on channel, status, and createdAt for efficient querying
 * - TTL index optional (can be added for auto-cleanup after retention period)
 * - Recipient is masked to protect PII
 * - No sensitive data (OTP, email body) is ever stored
 */
const communicationAuditSchema = new mongoose.Schema({
    // Unique identifier for tracing requests across systems
    requestId: {
        type: String,
        required: true,
        index: true
    },
    
    // Communication channel: "email" | "whatsapp"
    channel: {
        type: String,
        required: true,
        enum: ['email', 'whatsapp'],
        index: true
    },
    
    // Type of event: "send_email" | "send_otp"
    eventType: {
        type: String,
        required: true,
        enum: ['send_email', 'send_otp']
    },
    
    // Masked recipient (email or phone number)
    // Example: "t***@example.com" or "91****7890"
    recipient: {
        type: String,
        required: true
    },
    
    // Template or purpose identifier (no actual content)
    templateName: {
        type: String,
        required: false,
        default: null
    },
    
    // Purpose of the communication
    purpose: {
        type: String,
        required: false,
        enum: ['login_verification', 'reset_password', 'change_password', 'email_verification', 'phone_verification', 'other'],
        default: 'other'
    },
    
    // Status of the communication attempt
    status: {
        type: String,
        required: true,
        enum: ['success', 'failed', 'pending'],
        index: true
    },
    
    // Error message if failed (sanitized, no stack traces in production)
    errorMessage: {
        type: String,
        required: false,
        default: null
    },
    
    // Provider response metadata (sanitized)
    providerResponse: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
        default: null
    },
    
    // Who/what triggered this communication
    // Can be a user ID, "system", or specific service name
    triggeredBy: {
        type: String,
        required: false,
        default: 'system'
    },
    
    // Additional metadata (non-sensitive)
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
        default: {}
    },
    
    // Provider used (nodemailer, myoperator, etc.)
    provider: {
        type: String,
        required: false,
        default: null
    },
    
    // Response time in milliseconds
    responseTimeMs: {
        type: Number,
        required: false,
        default: null
    },
    
    // Retry count (if this is a retry attempt)
    retryCount: {
        type: Number,
        required: false,
        default: 0
    },
    
    // IP address of the requester (if available)
    ipAddress: {
        type: String,
        required: false,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Compound index for common query patterns
communicationAuditSchema.index({ channel: 1, status: 1, createdAt: -1 });
communicationAuditSchema.index({ recipient: 1, createdAt: -1 });
communicationAuditSchema.index({ triggeredBy: 1, createdAt: -1 });

// Optional: TTL index for automatic cleanup (uncomment to enable)
// This will delete documents after 90 days
// communicationAuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const CommunicationAudit = mongoose.model('CommunicationAudit', communicationAuditSchema);

module.exports = CommunicationAudit;

