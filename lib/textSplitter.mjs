/**
 * Lightweight recursive text splitter.
 *
 * Replaces LangChain's `RecursiveCharacterTextSplitter`. The project no longer
 * depends on `langchain`, because its optional peer dependencies
 * (`@langchain/anthropic`, `@langchain/aws`, ...) require `@langchain/core@^1`
 * while `langchain@0.3` itself requires `>=0.3.58 <0.4.0`. That deadlock makes
 * a plain `npm install` fail on Vercel.
 *
 * Strategy: split on the largest natural boundary first (paragraph, then
 * sentence, then word), then greedily pack the pieces into chunks of at most
 * `chunkSize` characters, carrying `chunkOverlap` characters of context into
 * the following chunk.
 */

const PARAGRAPH = /\n\s*\n/;
const SENTENCE = /(?<=[.!?])\s+/;

/** Largest piece we will emit before falling back to word-level packing. */
const ATOM_LIMIT = 200;

/**
 * Break raw text into small, semantically meaningful pieces.
 * @param {string} text
 * @returns {string[]}
 */
function toAtoms(text) {
    const atoms = [];

    for (const paragraph of text.split(PARAGRAPH)) {
        const trimmed = paragraph.trim();
        if (!trimmed) continue;

        for (const sentence of trimmed.split(SENTENCE)) {
            const piece = sentence.trim();
            if (!piece) continue;

            if (piece.length <= ATOM_LIMIT) {
                atoms.push(piece);
                continue;
            }

            // Very long sentence (or prose with no punctuation): pack by words.
            let window = "";
            for (const word of piece.split(/\s+/)) {
                const candidate = window ? `${window} ${word}` : word;
                if (candidate.length > ATOM_LIMIT) {
                    if (window) atoms.push(window);
                    window = word.slice(0, ATOM_LIMIT);
                } else {
                    window = candidate;
                }
            }
            if (window) atoms.push(window);
        }
    }

    return atoms;
}

/** Last `max` characters of `text`, moved forward to the next word boundary. */
function tail(text, max) {
    if (text.length <= max) return text;
    const slice = text.slice(-max);
    const space = slice.indexOf(" ");
    return space === -1 ? slice : slice.slice(space + 1);
}

/**
 * Split text into overlapping chunks.
 *
 * @param {string} text
 * @param {{ chunkSize?: number, chunkOverlap?: number }} [options]
 * @returns {string[]}
 */
export function splitText(text, { chunkSize = 512, chunkOverlap = 100 } = {}) {
    const atoms = toAtoms(text);
    const chunks = [];
    let current = "";

    for (const atom of atoms) {
        const candidate = current ? `${current}\n\n${atom}` : atom;

        if (current && candidate.length > chunkSize) {
            chunks.push(current);

            const overlap = chunkOverlap > 0 ? tail(current, chunkOverlap) : "";
            current = overlap ? `${overlap}\n\n${atom}` : atom;

            // If the overlap alone blows the budget, start clean instead.
            if (current.length > chunkSize + chunkOverlap) current = atom;
        } else {
            current = candidate;
        }
    }

    if (current) chunks.push(current);
    return chunks;
}

/**
 * LangChain-compatible wrapper so the seed script's call site is unchanged.
 * @param {{ chunkSize?: number, chunkOverlap?: number }} [options]
 */
export function createTextSplitter(options) {
    return {
        splitText: (text) => Promise.resolve(splitText(text, options)),
    };
}
