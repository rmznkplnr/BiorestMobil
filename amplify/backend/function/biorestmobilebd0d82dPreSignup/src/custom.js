/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event, context) => {
    console.log('Pre Sign-up trigger:', JSON.stringify(event, null, 2));

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = event.request.userAttributes.email;

    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    // Auto confirm user and verify email
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;

    // Log successful validation
    console.log(`Pre Sign-up validation successful for email: ${email}`);

    return event;
}; 