import { pipeline } from "@huggingface/transformers";

/**
 * Local embedding model.
 *
 * Runs entirely on-device through transformers.js (ONNX), so embeddings need
 * NO API key and cost nothing. DeepSeek has no embeddings endpoint, which is
 * why this lives here instead of pointing at api.deepseek.com.
 */
export const EMBEDDING_MODEL = "onnx-community/all-MiniLM-L6-v2-ONNX";

/** all-MiniLM-L6-v2 produces 384-dimension vectors. */
export const EMBEDDING_DIMENSION = 384;

let extractorPromise;

/** Lazily create (and cache) the feature-extraction pipeline. */
function getExtractor() {
    if (!extractorPromise) {
        extractorPromise = pipeline("feature-extraction", EMBEDDING_MODEL);
    }
    return extractorPromise;
}

/**
 * Create normalized embeddings for one or more pieces of text.
 *
 * Vectors are L2-normalized, so AstraDB's `dot_product` metric behaves like
 * cosine similarity.
 *
 * @param {string | string[]} texts
 * @returns {Promise<number[][]>} one 384-length array per input text
 */
export async function createEmbeddings(texts) {
    const input = Array.isArray(texts) ? texts : [texts];
    if (input.length === 0) return [];

    const extractor = await getExtractor();
    const output = await extractor(input, { pooling: "mean", normalize: true });

    const rows = output.dims[0];
    const dim = output.dims[output.dims.length - 1];

    const vectors = [];
    for (let i = 0; i < rows; i += 1) {
        vectors.push(Array.from(output.data.slice(i * dim, (i + 1) * dim)));
    }
    return vectors;
}

/**
 * Convenience wrapper for a single piece of text.
 *
 * @param {string} text
 * @returns {Promise<number[]>} a 384-length vector
 */
export async function createEmbedding(text) {
    const [vector] = await createEmbeddings(text);
    return vector;
}
