import DynamoDB from 'aws-sdk/clients/dynamodb.js';
import { v4 as uuidv4 } from 'uuid';
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { responseObject } from './utils.mjs';
const tableName = process.env.TABLE_NAME

export const lambdaHandler = async (event, context) => {
    let message = JSON.parse(event.body);
    const validation = validateBody(message);
    if(!validation.valid) {
        return responseObject(400, validation.errors);
    }

    if(message.sender !== '88888888') {
        return responseObject(400, {message: 'Sender not accepted'});
    }

    const messageId = await saveMessage(message);
    return responseObject(202, {messageId: messageId});
};

const saveMessage = async (message) => {
    try {
        const dynamoClient = new DynamoDB.DocumentClient();
        const generatedId = uuidv4();
        message.id = generatedId;
        await dynamoClient.put({ TableName: tableName, Item: message }).promise();
        return generatedId;
    } catch (error) {
        throw new Error(error);
    }
}

const validateBody = (body) => {
    const ajv = new Ajv();
    addFormats(ajv);
    ajv.addFormat('ISO_8601', /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\+\d{2}:\d{2})$/);
    const schema = {
        type: 'object',
        properties: {
            sender: { type: 'string' },
            msisdn: { type: 'string' },
            message: { type: 'string' },
            datetime: { type: 'string', format: 'ISO_8601' },
        },
        required: ['sender', 'msisdn', 'message', 'datetime'],
        additionalProperties: false,
    };
    const validate = ajv.compile(schema);
    const valid = validate(body);
    return {
        valid: valid,
        errors: validate?.errors
    }
}