/** @type {import("next").NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // FIXME: possible problem with serverless
    config.externals = [...config.externals, "canvas"];
    return config;
  },
};

module.exports = nextConfig;
