/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      layers: true,
      asyncWebAssembly: true,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      wbg: false,
      "pino-pretty": false,
      encoding: false,
    };
    if (!isServer) {
      config.output.environment = { ...config.output.environment, asyncFunction: true };
    }

    patchWasmModuleImport(config, isServer);

    return config;
  },
};

function patchWasmModuleImport(config, isServer) {
  config.experiments = Object.assign(config.experiments || {}, {
    asyncWebAssembly: true,
    layers: true,
    topLevelAwait: true
  });

  config.optimization.moduleIds = 'named';

  config.module.rules.push({
    test: /\.wasm$/,
    type: 'asset/resource',
  });

  // TODO: improve this function -> track https://github.com/vercel/next.js/issues/25852
  if (isServer) {
    config.output.webassemblyModuleFilename = './../static/wasm/tfhe_bg.wasm';
  } else {
    config.output.webassemblyModuleFilename = 'static/wasm/tfhe_bg.wasm';
  }
}

export default nextConfig;
