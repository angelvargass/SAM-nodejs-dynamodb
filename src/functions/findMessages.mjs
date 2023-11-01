import DynamoDB from 'aws-sdk/clients/dynamodb.js';
import { responseObject } from './utils.mjs';
const tableName = process.env.TABLE_NAME

export const lambdaHandler = async (event, context) => {
    const messageString = event.queryStringParameters?.message || undefined;
    const messages = await findMessages(messageString);
    return responseObject(200, { messages: messages });
};

const findMessages = async (messageString) => {
    try {
        const dynamoClient = new DynamoDB.DocumentClient();
        if (messageString) {
            const params = {
                TableName: tableName,
                FilterExpression: 'message = :value',
                ExpressionAttributeValues: {
                    ':value': messageString.toLowerCase()
                }
            }
            const response = await dynamoClient.scan(params).promise();
            return response.Items;
        }

        const response = await dynamoClient.scan({ TableName: tableName }).promise();
        return response.Items;
    } catch (error) {
        throw new Error(error);
    }
}