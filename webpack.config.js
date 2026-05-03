const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  // Load Expo's default webpack config
  const config = await createExpoWebpackConfigAsync(env, argv);
  config.devServer = config.devServer || {};

  // so routes like /Auth or /AdminStack won't 404 on web
  config.devServer.historyApiFallback = true;

  return config;
};
