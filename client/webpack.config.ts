import type { Configuration } from 'webpack';

import merge from 'webpack-merge';
import path from 'path';
import minimist from 'minimist';

import * as parts from './webpack.parts';

const argv = minimist(process.argv.slice(2));

const mode: 'development' | 'production' = argv.mode || 'production';

const commonConfig: Configuration = merge([
  {
    entry: ['./src/index.tsx'],

    output: {
      path: path.resolve(__dirname, 'dist'),
    },
  },
  parts.cleanOutputDir(),
  parts.resolve(),
  parts.outputFilenames(),

  parts.loadPage(),
  parts.loadCSS(),
  parts.loadFonts(),
  parts.loadImages(),
  parts.loadTS(),
]);

const productionConfig: Configuration = merge([
  {
    target: 'browserslist',
    optimization: {
      runtimeChunk: { name: 'runtime' },
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 10000,
        maxSize: 40000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
          },
        },
      },
    },
  },
  parts.optimizeCode(),
  parts.optimizeCSS(),
  parts.optimizeJS(),
]);

const developmentConfig: Configuration = merge([
  {
    target: 'web',
    devtool: 'eval-source-map',
  },
  parts.devServer(),
]);

const configs = {
  production: productionConfig,
  development: developmentConfig,
};

// noinspection JSUnusedGlobalSymbols
export default merge(commonConfig, configs[mode], { mode });
