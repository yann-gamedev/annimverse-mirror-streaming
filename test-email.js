// Email Configuration Test Script
// Run this to test your email setup before using it in production

require('dotenv').config();
const { testEmailConfig, sendWelcomeEmail } = require('./services/email.service');

async function runEmailTest() {
    console.log('\n🔍 Testing Email Configuration...\n');

    // Display current config (hide password)
    console.log('📧 Current SMTP Settings:');
    console.log(`   Host: ${process.env.SMTP_HOST || 'NOT SET'}`);
    console.log(`   Port: ${process.env.SMTP_PORT || 'NOT SET'}`);
    console.log(`   User: ${process.env.SMTP_USER || 'NOT SET'}`);
    console.log(`   Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);
    console.log(`   From: ${process.env.SMTP_FROM || 'NOT SET'}\n`);

    // Test 1: Verify connection
    console.log('Test 1: Verifying SMTP connection...');
    const connectionTest = await testEmailConfig();

    if (!connectionTest) {
        console.log('\n❌ SMTP Connection Failed!\n');
        console.log('Common issues:');
        console.log('1. ⚠️  Using regular Gmail password instead of App Password');
        console.log('2. ⚠️  2-Step Verification not enabled');
        console.log('3. ⚠️  Wrong SMTP host or port');
        console.log('4. ⚠️  App Password has spaces (remove them)');
        console.log('5. ⚠️  "Less secure app access" is OFF (old Gmail accounts)\n');
        console.log('How to create Gmail App Password:');
        console.log('1. Go to: https://myaccount.google.com/security');
        console.log('2. Enable 2-Step Verification');
        console.log('3. Go to: https://myaccount.google.com/apppasswords');
        console.log('4. Create password for "Mail" app');
        console.log('5. Copy the 16-char password to .env SMTP_PASS\n');
        process.exit(1);
    }

    console.log('✅ SMTP Connection successful!\n');

    // Test 2: Send test email
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question('Send a test welcome email? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
            readline.question('Enter test email address: ', async (email) => {
                console.log('\n📤 Sending test email to:', email);

                const sendResult = await sendWelcomeEmail(email, 'Test User');

                if (sendResult) {
                    console.log('\n✅ Test email sent successfully!');
                    console.log('📬 Check your inbox (and spam folder)\n');
                } else {
                    console.log('\n❌ Failed to send test email');
                    console.log('Check the error logs above for details\n');
                }

                readline.close();
                process.exit(0);
            });
        } else {
            console.log('\n✅ Email configuration is working!');
            console.log('You can now use the email features.\n');
            readline.close();
            process.exit(0);
        }
    });
}

// Run test
runEmailTest();
