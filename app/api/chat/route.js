import { createEmbedding } from "@/lib/embeddings.mjs";
import { createOpenAI } from "@ai-sdk/openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { streamText } from "ai";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APP_TOKEN,
    DEEPSEEK_API_KEY,
} = process.env;

// DeepSeek exposes an OpenAI-compatible API, so we point the OpenAI provider
// at DeepSeek's base URL.
const deepseek = createOpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: DEEPSEEK_API_KEY,
});
const client = new DataAPIClient(ASTRA_DB_APP_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req) {
    try {
        const { messages } = await req.json();
        const latestMessage = messages[messages.length - 1]?.content;

        let docContext = "";

        try {
            // Embeddings are generated locally (384 dims) via transformers.js.
            // DeepSeek has no embeddings endpoint, so this replaces the old
            // OpenAI text-embedding-3-small call.
            const queryVector = await createEmbedding(latestMessage);

            const collection = await db.collection(ASTRA_DB_COLLECTION);
            const cursor = collection.find(null, {
                sort: {
                    $vector: queryVector,
                },
                limit: 10,
            });

            const documents = await cursor.toArray();
            const docsMap = documents?.map((doc) => doc.text);
            docContext = JSON.stringify(docsMap);
        } catch (error) {
            console.error("Context retrieval failed:", error);
            docContext = "";
        }

        const template = {
            role: "system",
            content: `You are an AI assistant who knows everything about Football. Use the below context to augment what you know about Football. The context will provide you with the most recent page data from wikipedai, the official FIFA website, and other football-related websites.
            If the context does not include the information you need, answer based on your existing knowledge and do not mention the source of your information or what the context does or doesnot include. If you are asked about any questions not related to football, just simply apologize and say you are not able to answer that question. Do not answer any questions that are not related to football.
            Format response using markdown where applicable and donot return images.
    
            -------------------
            START CONTEXT
            ${docContext}
            END CONTEXT
            -------------------
            QUESTION: ${latestMessage}
            -------------------
            `,
        };

        // useChat messages carry extra fields (id, parts) that the model does
        // not accept, so only forward role + content.
        const chatMessages = messages.map(({ role, content }) => ({
            role,
            content,
        }));

        const result = streamText({
            model: deepseek.chat("deepseek-v4-pro"),
            messages: [template, ...chatMessages],
        });

        return result.toDataStreamResponse();
    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ message: "Internal server error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
