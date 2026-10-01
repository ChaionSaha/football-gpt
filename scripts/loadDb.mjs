import { DataAPIClient } from "@datastax/astra-db-ts";
import "dotenv/config";
import puppeteer from "puppeteer";
import { createEmbeddings, EMBEDDING_DIMENSION } from "../lib/embeddings.mjs";
import { createTextSplitter } from "../lib/textSplitter.mjs";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APP_TOKEN,
} = process.env;

const fbData = [
    "https://en.wikipedia.org/wiki/Football",
    "https://fbref.com/en/",
    "https://www.fifa.com/en",
    "https://www.fifa.com/en/news",
    "https://www.soccerbase.com/matches/home.sd",
    "https://www.whoscored.com/",
    "https://www.flashscore.com/",
    "https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_finals",
    "https://inside.fifa.com/fifa-world-ranking/men",
    "https://en.wikipedia.org/wiki/Ballon_d%27Or",
];

const client = new DataAPIClient(ASTRA_DB_APP_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = createTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
});

const BATCH_SIZE = 25;

/**
 * Make sure the collection exists with a vector dimension that matches the
 * local embedding model. If it was created for a different model (for example
 * the old 1536-dim OpenAI embeddings), drop it and recreate it.
 */
const ensureCollection = async () => {
    const collections = await db.listCollections();
    const existing = collections.find((c) => c.name === ASTRA_DB_COLLECTION);
    const currentDimension = existing?.options?.vector?.dimension;

    if (existing && currentDimension !== EMBEDDING_DIMENSION) {
        console.log(
            `Collection "${ASTRA_DB_COLLECTION}" has dimension ${currentDimension}; recreating with ${EMBEDDING_DIMENSION}.`,
        );
        await db.dropCollection(ASTRA_DB_COLLECTION);
    }

    if (!existing || currentDimension !== EMBEDDING_DIMENSION) {
        await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: EMBEDDING_DIMENSION,
                metric: "dot_product",
            },
        });
        console.log(
            `Created collection "${ASTRA_DB_COLLECTION}" (${EMBEDDING_DIMENSION} dims).`,
        );
    }
};

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION);

    for (const url of fbData) {
        const content = await scrapePageDirectly(url);
        const chunks = await splitter.splitText(content);
        console.log(`Scraped ${chunks.length} chunks from ${url}`);

        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE);
            const vectors = await createEmbeddings(batch);

            const documents = batch.map((text, index) => ({
                $vector: vectors[index],
                text,
            }));

            await collection.insertMany(documents);
            console.log(
                `Inserted ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length} chunks from ${url}`,
            );
        }
    }
};

const scrapePageDirectly = async (url) => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath:
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        const content = await page.evaluate(() => document.body.innerText);
        return content;
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        throw new Error(`Failed to scrape content from ${url}`);
    } finally {
        await browser.close();
    }
};

await ensureCollection();
await loadSampleData();
