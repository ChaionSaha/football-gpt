/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // transformers.js / onnxruntime-node ship native binaries and must not be
    // bundled by the server compiler.
    serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
};

export default nextConfig;
