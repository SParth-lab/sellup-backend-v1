const axios = require('axios');
const { logCommunicationAudit, createAuditContext } = require('./AuditService.js');

/**
 * Sends OTP via WhatsApp using MyOperator API
 * 
 * @param {string} phoneNumber - Recipient phone number (10 digits)
 * @param {string} otp - OTP code to send (NOT logged in audit)
 * @param {Object} auditContext - Audit context for tracking
 * @param {string} [auditContext.requestId] - Correlation ID
 * @param {string} [auditContext.triggeredBy] - User ID or "system"
 * @param {string} [auditContext.purpose] - Purpose of the OTP
 * @param {string} [auditContext.ipAddress] - Requester IP
 * @returns {Promise<Object>} - Provider response
 */
const sendOtpViaWhatsapp = async (phoneNumber, otp, auditContext = null) => {
    // Create audit context if not provided
    const context = auditContext || createAuditContext({ purpose: 'phone_verification' });
    const startTime = context.startTime || Date.now();
    
    let data = JSON.stringify({
        "phone_number_id": process.env.MYOPERATOR_PHONE_NUMBER_ID,
        "customer_country_code": "91",
        "customer_number": phoneNumber,
        "data": {
            "type": "template",
            "language": "en",
            "context": {
                "template_name": "login_otp",
                "language": "en",
                "body": {
                    "otp": otp + ""
                },
                "buttons": [
                    {
                        "index": 0,
                        "otp": otp + ""
                    }
                ]
            }
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.MYOPERATOR_BASE_URL + '/chat/messages',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + process.env.MYOPERATOR_API_KEY,
            'X-MYOP-COMPANY-ID': process.env.MYOPERATOR_COMPANY_ID
        },
        data: data
    };

    try {
        const response = await axios.request(config);
        const responseTimeMs = Date.now() - startTime;
        
        console.log('WhatsApp OTP sent successfully:', response.data);
        
        // Log success audit (non-blocking)
        await logCommunicationAudit({
            channel: 'whatsapp',
            eventType: 'send_otp',
            recipient: phoneNumber,
            templateName: 'login_otp',
            purpose: context.purpose || 'phone_verification',
            status: 'success',
            error: null,
            providerResponse: {
                status: response.data?.status,
                messageId: response.data?.message_id || response.data?.id,
                code: response.data?.code
            },
            triggeredBy: context.triggeredBy || 'system',
            requestId: context.requestId,
            provider: 'myoperator',
            responseTimeMs: responseTimeMs,
            ipAddress: context.ipAddress
        });
        
        return response.data;
    } catch (error) {
        const responseTimeMs = Date.now() - startTime;
        
        console.error('Failed to send WhatsApp OTP:', error.response?.data || error.message);
        
        // Log failed audit (non-blocking)
        await logCommunicationAudit({
            channel: 'whatsapp',
            eventType: 'send_otp',
            recipient: phoneNumber,
            templateName: 'login_otp',
            purpose: context.purpose || 'phone_verification',
            status: 'failed',
            error: error.response?.data?.message || error.message,
            providerResponse: error.response?.data ? {
                status: error.response.data.status,
                code: error.response.data.code,
                message: error.response.data.message
            } : null,
            triggeredBy: context.triggeredBy || 'system',
            requestId: context.requestId,
            provider: 'myoperator',
            responseTimeMs: responseTimeMs,
            ipAddress: context.ipAddress
        });
        
        throw new Error('WhatsApp OTP send failed');
    }
};

module.exports = { sendOtpViaWhatsapp };
