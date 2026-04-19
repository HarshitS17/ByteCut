import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body || "{}");
        const longUrl = body.url;

        // 🔹 Validation
        if (!longUrl) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "URL required" })
            };
        }

        // 🔹 Generate short ID
        const shortId = Math.random().toString(36).substring(2, 8);

        // 🔹 Store URL
        await client.send(new PutItemCommand({
            TableName: "UrlShortener",
            Item: {
                shortId: { S: shortId },
                longUrl: { S: longUrl }
            }
        }));

        // 🔥 Increment global counter
        await client.send(new UpdateItemCommand({
            TableName: "UrlShortener",
            Key: {
                shortId: { S: "COUNTER" }
            },
            UpdateExpression: "SET #c = if_not_exists(#c, :zero) + :inc",
            ExpressionAttributeNames: {
                "#c": "count"
            },
            ExpressionAttributeValues: {
                ":inc": { N: "1" },
                ":zero": { N: "0" }
            }
        }));

        // 🔹 Response
        return {
            statusCode: 200,
            body: JSON.stringify({
                shortId: shortId
            })
        };

    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};