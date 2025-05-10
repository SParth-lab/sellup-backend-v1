const axios = require('axios');


const sendOtpViaWhatsapp = async (phoneNumber, otp) => {


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
    console.log('WhatsApp OTP sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send WhatsApp OTP:', error.response?.data || error.message);
    throw new Error('WhatsApp OTP send failed');
  }
}

module.exports = { sendOtpViaWhatsapp };