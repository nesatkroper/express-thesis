const mailTemplate = (email, otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your One-Time Password (OTP)</title>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        body {
            font-family: "Poppins", serif;
            background-color: #f7fafc;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 400px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .header img {
            width: 100px;
            margin-bottom: 10px;
            border-radius: 10px;
        }
        .header h2 {
            color: #2d3748;
            margin: 0;
            font-size: 20px;
            font-weight: 600;
        }
        .content {
            padding: 20px 0;
            text-align: center;
        }
        .otp-code {
            font-size: 32px;
            font-weight: 700;
            color: #4CAF50;
            margin: 20px 0;
            padding: 15px;
            background-color: #f0f8f0;
            border-radius: 8px;
            display: inline-block;
            letter-spacing: 4px;
        }
        .info {
            font-size: 14px;
            color: #4a5568;
            margin: 10px 0;
        }
        .cta-button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #718096;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
       
        <div class="header">
            <img src="https://raw.githubusercontent.com/nesatkroper/img/refs/heads/main/phanunLogo.webp" alt="YourApp Logo">
            <h2>Your One-Time Password (OTP)</h2>
        </div>

       
        <div class="content">
            <p>Hello, <b>${email}</b></p>
            <p>We received a request to verify your account. Please use the following One-Time Password (OTP) to complete your verification:</p>
            <div class="otp-code">${otp}</div>
            <p class="info">This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            <p class="info">If you did not request this OTP, please ignore this email or contact our support team immediately.</p>
        </div>

   
        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@yourapp.com">support@yourapp.com</a>.</p>
            <p>&copy; 2023 YourApp. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

const mailTemplateRedesign = (email, otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP is Here!</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        body {
            font-family: "Poppins", serif;
            background-color: #e9ecef;
            margin: 0;
            padding: 0;
            color: #212529;
        }
        .container {
            max-width: 420px;
            margin: 30px auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.07);
        }
        .logo-area {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dee2e6;
        }
        .logo-area img {
            width: 90px;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .message {
            padding: 25px 0;
            text-align: center;
        }
        .message h2 {
            color: #1c7ed6;
            margin-bottom: 15px;
            font-size: 22px;
            font-weight: 600;
        }
        .otp-action {
            margin: 25px 0;
            text-align: center;
        }
        .otp-button {
            background-color: #1c7ed6;
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            padding: 15px 35px;
            border-radius: 8px;
            display: inline-block;
            letter-spacing: 5px;
            text-decoration: none;
        }
        .expiry-info {
            font-size: 14px;
            color: #6c757d;
            margin-top: 15px;
        }
        .security-note {
            font-size: 13px;
            color: #555;
            margin-top: 20px;
            line-height: 1.5;
        }
        .support-link {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            font-size: 12px;
            color: #868e96;
        }
        .support-link a {
            color: #1c7ed6;
            text-decoration: none;
        }
        .support-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-area">
            <img src="https://raw.githubusercontent.com/nesatkroper/img/refs/heads/main/phanunLogo.webp" alt="YourApp Logo">
        </div>
        <div class="message">
            <h2>Here's Your Verification Code</h2>
            <p>Hello, ${email},</p>
            <p>Use the following code to complete the verification process:</p>
        </div>
        <div class="otp-action">
            <div class="otp-button">${otp}</div>
            <p class="expiry-info">This code will expire in 5 minutes.</p>
        </div>
        <p class="security-note">For your security, please do not share this OTP with anyone. Our team will never ask you for this code.</p>
        <div class="support-link">
            <p>If you did not request this code, please ignore this email or contact our support at <a href="mailto:support@yourapp.com">support@yourapp.com</a>.</p>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = { mailTemplate, mailTemplateRedesign };
