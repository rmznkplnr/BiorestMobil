/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
    console.log('Post Confirmation trigger:', JSON.stringify(event, null, 2));

    try {
        // Yeni kullanıcı için UserActivity tablosunda kayıt oluştur
        const params = {
            TableName: 'UserActivity',
            Item: {
                userId: event.userName,
                email: event.request.userAttributes.email,
                createdAt: new Date().toISOString(),
                lastLoginTime: new Date().toISOString(),
                loginCount: 1,
                isActive: true
            }
        };

        await docClient.send(new PutCommand(params));
        console.log(`User activity record created for: ${event.userName}`);

        // Başarılı kayıt bildirimi
        console.log(`User ${event.userName} registration completed successfully`);
        
        return event;
    } catch (error) {
        console.error('Error creating user activity record:', error);
        // Hata durumunda bile event'i döndür
        return event;
    }
};
