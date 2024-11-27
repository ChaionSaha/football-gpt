import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import puppeteer from "puppeteer";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APP_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);
  if (!collection) {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
      vector: {
        dimension: 1536,
        metric: "dot_product",
      },
    });
    console.log("from line 47", res);
  }
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);

  for await (const url of fbData) {
    const content = await scrapePageDirectly(url);
    if (typeof content !== "string") {
      throw new Error(`Scraped content is not a string: ${typeof content}`);
    }
    const chunks = await splitter.splitText(content);
    console.log(`type of chunks: ${typeof chunks}`);

    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding;
      const res = await collection.insertOne({
        $vector: vector,
        text: chunk,
      });
      console.log(res);
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

createCollection().then(() => loadSampleData());
