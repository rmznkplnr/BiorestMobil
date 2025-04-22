/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
    console.log(`Post Authentication trigger for user: ${event.userName}`);
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        // Kullanıcının son giriş zamanını güncelle
        const params = {
            TableName: 'UserActivity', // DynamoDB tablo adı
            Key: {
                userId: event.userName
            },
            UpdateExpression: 'SET lastLoginTime = :time, loginCount = if_not_exists(loginCount, :start) + :inc',
            ExpressionAttributeValues: {
                ':time': new Date().toISOString(),
                ':inc': 1,
                ':start': 0
            },
            ReturnValues: 'UPDATED_NEW'
        };

        const result = await docClient.send(new UpdateCommand(params));
        console.log('Updated user activity:', result);

        // Başarılı giriş bildirimi
        console.log(`User ${event.userName} successfully logged in at ${new Date().toISOString()}`);
        
        return event;
    } catch (error) {
        console.error('Error updating user activity:', error);
        // Hata durumunda bile event'i döndür (authentication sürecini engellemez)
        return event;
    }
};
