const nextConfig = {
  webpack(config: { resolve: { fallback: { fs: boolean } } }) {
    config.resolve.fallback.fs = false;
    return config;
  },
};

module.exports = nextConfig;
