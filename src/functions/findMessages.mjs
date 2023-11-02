import DynamoDB from 'aws-sdk/clients/dynamodb.js';
import { responseObject } from './utils.mjs';
const tableName = process.env.TABLE_NAME

export const lambdaHandler = async (event, context) => {
    const messages = await findMessages();
    return responseObject(200, { messages: messages });
};

const findMessages = async () => {
    try {
        const dynamoClient = new DynamoDB.DocumentClient();
        const response = await dynamoClient.scan({ TableName: tableName }).promise();
        return response.Items;
    } catch (error) {
        throw new Error(error);
    }
}