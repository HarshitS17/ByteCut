import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
    try {
        const shortId = event.pathParameters.shortId;

        const result = await client.send(new GetItemCommand({
            TableName: "UrlShortener",
            Key: {
                shortId: { S: shortId }
            }
        }));

        if (!result.Item) {
            return {
                statusCode: 404,
                body: "URL not found"
            };
        }

        const longUrl = result.Item.longUrl.S;

        return {
            statusCode: 301,
            headers: {
                Location: longUrl
            }
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: err.message
        };
    }
};