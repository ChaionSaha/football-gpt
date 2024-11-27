import OpenAI from "openai";
import { streamText } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { openai as aisdk } from "@ai-sdk/openai";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APP_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const client = new DataAPIClient(ASTRA_DB_APP_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1]?.content;

    let docContext = "";

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });

      const documents = await cursor.toArray();
      const docsMap = documents?.map((doc) => doc.text);
      docContext = JSON.stringify(docsMap);
    } catch (error) {
      console.log(error);
      docContext = "";
    }

    const template = {
      role: "system",
      content: `You are an AI assistant who knows everything about Football. Use the below context to augment what you know about Football. The context will provide you with the most recent page data from wikipedai, the official FIFA website, and other football-related websites.
            If the context does not include the information you need, answer based on your wxisting knowledge and do not mention the source of your information or what the cointext does or doesnot include. If you are asked about any questions not related to football, just simply apologize and say you are not able to answer that question. Do not answer any questions that are not related to football.
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

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   stream: true,
    //   messages: [template, ...messages],
    // });

    const result = streamText({
      model: aisdk("gpt-4o"),
      messages: [template, ...messages],
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// export default async function handler(req, res) {
//   if (req.method !== "POST")
//     return res.status(405).json({ message: "Method not allowed" });

//   try {
//     const { messages } = req.body;
//     const latestMessage = messages[messages.length - 1]?.content;

//     let docContext = "";

//     const embedding = await openai.embeddings.create({
//       model: "text-embedding-3-small",
//       input: latestMessage,
//       encoding_format: "float",
//     });

//     try {
//       const collection = await db.collection(ASTRA_DB_COLLECTION);
//       const cursor = collection.find(null, {
//         sort: {
//           $vector: embedding.data[0].embedding,
//         },
//         limit: 10,
//       });

//       const documents = await cursor.toArray();
//       const docsMap = documents?.map((doc) => doc.text);
//       docContext = JSON.stringify(docsMap);
//     } catch (error) {
//       console.log(error);
//       docContext = "";
//     }

//     const template = {
//       role: "system",
//       content: `You are an AI assistant who knows everything about Football. Use the below context to augment what you know about Football. The context will provide you with the most recent page data from wikipedai, the official FIFA website, and other football-related websites.
//         If the context does not include the information you need, answer based on your wxisting knowledge and do not mention the source of your information or what the cointext does or doesnot include.
//         Format response using markdown where applicable and donot return images.

//         -------------------
//         START CONTEXT
//         ${docContext}
//         END CONTEXT
//         -------------------
//         QUESTION: ${latestMessage}
//         -------------------
//         `,
//     };

//     // const response = await openai.chat.completions.create({
//     //   model: "gpt-4",
//     //   stream: true,
//     //   messages: [template, ...messages],
//     // });

//     const result = streamText({
//       model: aisdk("gpt-4o"),
//       messages: [template, ...messages],
//     });

//     return result.toDataStreamResponse();
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }
