const { ProvidePlugin } = require("webpack");

module.exports = {
  webpack: function override(config, env) {
    if (!config.plugins) {
      config.plugins = [];
    }

    config.plugins.push(
      new ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      })
    );

    config.resolve = {
      ...config.resolve,
      fallback: {
        buffer: require.resolve("buffer/"),
        vm: require.resolve("vm-browserify"),
        url: require.resolve("url/"),
        constants: require.resolve("constants-browserify"),
        util: require.resolve("util/"),
        stream: require.resolve("stream-browserify"),
      },
    };
    return config;
  },
};
