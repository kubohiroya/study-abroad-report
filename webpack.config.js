const path = require("path");
const GasPlugin = require("gas-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: false,
    context: __dirname,
    entry: "./src/main.ts",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "main.js",
    },
    resolve: {
        extensions: [".ts"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
            },
        ],
    },
    plugins: [new GasPlugin()],
};
