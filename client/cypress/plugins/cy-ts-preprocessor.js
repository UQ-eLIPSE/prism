import wp from "@cypress/webpack-preprocessor";

const webpackOptions = {
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
};

const options = {
  webpackOptions,
};

export default wp(options);
