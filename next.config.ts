/** @type {import('next').NextConfig} */
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  reactStrictMode: true,
  webpack: (config: any, { }) => {
    config.resolve.extensions.push(".ts", ".tsx");
    config.resolve.fallback = { fs: false };

    config.plugins.push(
      new NodePolyfillPlugin(), 
      new CopyPlugin({
        patterns: [
          // Copy ONNX Runtime WASM files
          {
            from: './node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm',
            to: 'static/chunks/pages',
          },
          {
            from: './node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs',
            to: 'static/chunks/pages',
          },
          // Copy your neural style transfer model
          {
            from: './models', // Make sure your .onnx file is in this folder
            to: 'static/chunks/pages',
          },
        ],
      }),
    );

    return config;
  }
};