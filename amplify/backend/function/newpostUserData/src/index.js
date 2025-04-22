/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    // CORS headers
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    };
    
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Preflight call successful' }),
        };
    }
    
    try {
        // Parse the incoming data
        const requestBody = JSON.parse(event.body);
        const { userId, userData } = requestBody;
        
        if (!userId || !userData) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: userId and userData are required' }),
            };
        }
        
        // Store data in DynamoDB
        const params = {
            TableName: process.env.STORAGE_TABLE || 'UserDataTable',
            Item: {
                id: userId,
                data: userData,
                createdAt: new Date().toISOString(),
            }
        };
        
        await docClient.put(params).promise();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'User data saved successfully' 
            }),
        };
    } catch (error) {
        console.error('Error processing request:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'An error occurred processing your request',
                message: error.message
            }),
        };
    }
};
