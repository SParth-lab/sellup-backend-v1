const { v4: uuidv4 } = require('uuid');
const CommunicationAudit = require('../Models/CommunicationAudit');

/**
 * AuditService - Centralized communication audit logging
 * 
 * Design Principles:
 * - Non-blocking: Audit logging never breaks the main flow
 * - Secure: Masks sensitive data (emails, phone numbers)
 * - Consistent: Standardized format across all channels
 * - Traceable: Each request gets a unique correlation ID
 */

/**
 * Masks an email address for privacy
 * Example: "test@example.com" -> "t***@example.com"
 * @param {string} email - The email to mask
 * @returns {string} - Masked email
 */
const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return '***';
    
    const parts = email.split('@');
    if (parts.length !== 2) return '***';
    
    const [localPart, domain] = parts;
    if (localPart.length <= 1) {
        return `${localPart}***@${domain}`;
    }
    
    const visibleChars = Math.min(2, Math.floor(localPart.length / 3));
    const masked = localPart.substring(0, visibleChars) + '***';
    return `${masked}@${domain}`;
};

/**
 * Masks a phone number for privacy
 * Example: "9876543210" -> "98****3210"
 * @param {string} phone - The phone number to mask
 * @returns {string} - Masked phone number
 */
const maskPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return '***';
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return '***';
    
    const visibleStart = 2;
    const visibleEnd = 4;
    const maskedMiddle = '*'.repeat(cleaned.length - visibleStart - visibleEnd);
    
    return cleaned.substring(0, visibleStart) + maskedMiddle + cleaned.slice(-visibleEnd);
};

/**
 * Generates a unique request ID for correlation
 * @returns {string} - UUID v4
 */
const generateRequestId = () => {
    return uuidv4();
};

/**
 * Sanitizes error message to remove sensitive information
 * @param {Error|string} error - The error to sanitize
 * @returns {string|null} - Sanitized error message
 */
const sanitizeError = (error) => {
    if (!error) return null;
    
    const message = error instanceof Error ? error.message : String(error);
    
    // Remove potential sensitive patterns
    return message
        .replace(/password[=:]\s*\S+/gi, 'password=***')
        .replace(/token[=:]\s*\S+/gi, 'token=***')
        .replace(/key[=:]\s*\S+/gi, 'key=***')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@***.***')
        .substring(0, 500); // Limit error message length
};

/**
 * Sanitizes provider response to remove sensitive data
 * @param {Object} response - Provider response object
 * @returns {Object|null} - Sanitized response metadata
 */
const sanitizeProviderResponse = (response) => {
    if (!response) return null;
    
    // Extract only safe metadata
    const safeFields = ['messageId', 'response', 'status', 'code', 'accepted', 'rejected', 'envelope'];
    const sanitized = {};
    
    for (const field of safeFields) {
        if (response[field] !== undefined) {
            sanitized[field] = response[field];
        }
    }
    
    return Object.keys(sanitized).length > 0 ? sanitized : null;
};

/**
 * Logs a communication audit record
 * 
 * @param {Object} data - Audit data
 * @param {string} data.channel - "email" | "whatsapp"
 * @param {string} data.eventType - "send_email" | "send_otp"
 * @param {string} data.recipient - Email or phone number (will be masked)
 * @param {string} [data.templateName] - Template identifier
 * @param {string} [data.purpose] - Purpose of communication
 * @param {string} data.status - "success" | "failed" | "pending"
 * @param {Error|string} [data.error] - Error if failed
 * @param {Object} [data.providerResponse] - Raw provider response
 * @param {string} [data.triggeredBy] - User ID or "system"
 * @param {string} [data.requestId] - Correlation ID (generated if not provided)
 * @param {Object} [data.metadata] - Additional non-sensitive metadata
 * @param {string} [data.provider] - Provider name
 * @param {number} [data.responseTimeMs] - Response time in ms
 * @param {number} [data.retryCount] - Retry attempt number
 * @param {string} [data.ipAddress] - Requester IP
 * @returns {Promise<{requestId: string, success: boolean}>} - Result with request ID
 */
const logCommunicationAudit = async (data) => {
    const requestId = data.requestId || generateRequestId();
    
    try {
        // Determine if recipient is email or phone and mask accordingly
        const isEmail = data.channel === 'email';
        const maskedRecipient = isEmail 
            ? maskEmail(data.recipient)
            : maskPhone(data.recipient);
        
        const auditRecord = new CommunicationAudit({
            requestId,
            channel: data.channel,
            eventType: data.eventType,
            recipient: maskedRecipient,
            templateName: data.templateName || null,
            purpose: data.purpose || 'other',
            status: data.status,
            errorMessage: sanitizeError(data.error),
            providerResponse: sanitizeProviderResponse(data.providerResponse),
            triggeredBy: data.triggeredBy || 'system',
            metadata: data.metadata || {},
            provider: data.provider || null,
            responseTimeMs: data.responseTimeMs || null,
            retryCount: data.retryCount || 0,
            ipAddress: data.ipAddress || null
        });
        
        await auditRecord.save();
        
        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.log(`📋 [AUDIT] ${data.channel.toUpperCase()} ${data.status}: ${maskedRecipient} (${requestId})`);
        }
        
        return { requestId, success: true };
    } catch (error) {
        // Audit logging should never break the main flow
        console.error('⚠️ [AUDIT] Failed to write audit log:', error.message);
        return { requestId, success: false };
    }
};

/**
 * Creates an audit context that can be passed through the call chain
 * 
 * @param {Object} options - Context options
 * @param {string} [options.triggeredBy] - User ID or "system"
 * @param {string} [options.ipAddress] - Requester IP
 * @param {string} [options.purpose] - Communication purpose
 * @returns {Object} - Audit context object
 */
const createAuditContext = (options = {}) => {
    return {
        requestId: generateRequestId(),
        triggeredBy: options.triggeredBy || 'system',
        ipAddress: options.ipAddress || null,
        purpose: options.purpose || 'other',
        startTime: Date.now()
    };
};

/**
 * Calculates response time from audit context
 * 
 * @param {Object} context - Audit context with startTime
 * @returns {number} - Response time in milliseconds
 */
const getResponseTime = (context) => {
    if (!context || !context.startTime) return null;
    return Date.now() - context.startTime;
};

module.exports = {
    logCommunicationAudit,
    createAuditContext,
    getResponseTime,
    generateRequestId,
    maskEmail,
    maskPhone,
    sanitizeError,
    sanitizeProviderResponse
};

