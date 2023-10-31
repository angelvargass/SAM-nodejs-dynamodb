import DynamoDB from 'aws-sdk/clients/dynamodb.js';
import { responseObject } from './utils.mjs';
const tableName = process.env.TABLE_NAME

export const lambdaHandler = async (event, context) => {
    const id = event.pathParameters?.id;
    if (!id) {
        responseObject(400, 'Id is required');
    }

    const message = await findById(id);
    return responseObject(200, { message: message });
};

const findById = async (id) => {
    try {
        const dynamoClient = new DynamoDB.DocumentClient();
        const response = await dynamoClient.get({
            TableName: tableName,
            Key: {
                id
            }
        }).promise();
        return response.Item;
    } catch (error) {
        throw new Error(error);
    }
}