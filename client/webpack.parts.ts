import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import type { Configuration } from 'webpack';

import { DefinePlugin } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import path from 'path';
import minimist from 'minimist';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

const argv = minimist(process.argv.slice(2));
const { port } = argv;

const swcConfig = require('tsconfig-to-swcconfig').convert('./tsconfig.json');

swcConfig.jsc.baseUrl = path.resolve(__dirname, './');

export const devServer = (): Configuration => {
  const devServerConfig: DevServerConfiguration = {
    static: './dist',
    hot: false,
    port: parseInt(port || '', 10) || 3000,
  };
  return {
    devServer: devServerConfig,
  };
};

export const loadPage = (): Configuration => ({
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: ['html-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
    }),
  ],
});

export const loadCSS = (): Configuration => ({
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: /\.module\.\w+$/i,
                localIdentName: 'cg_[name]_[local]',
              },
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),
  ],
});

export const optimizeCSS = (): Configuration => ({
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
    ],
  },
});

export const loadTS = (): Configuration => ({
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        exclude: /node_modules/,
        include: [
          path.join(__dirname, 'src'),
          path.resolve(__dirname, '../shared/src'),
        ],
        use: [
          {
            loader: 'swc-loader',
            options: swcConfig,
          },
        ],
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
});

export const optimizeJS = (): Configuration => ({
  optimization: {
    minimizer: [
      '...',
      new TerserPlugin(),
    ],
  },
});

export const loadImages = (): Configuration => ({
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|webp|ico|pdf)$/i,
        type: 'asset',
      },
    ],
  },
});

export const optimizeCode = (): Configuration => ({
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
});

export const loadFonts = (): Configuration => ({
  module: {
    rules: [
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
});

export const resolve = (): Configuration => ({
  resolve: {
    alias: {
      Component: path.join(__dirname, 'src', 'components'),
      Image: path.join(__dirname, 'src', 'imgs'),
      Type: path.join(__dirname, 'src', 'types'),
      Store: path.join(__dirname, 'src', 'stores'),
      Service: path.join(__dirname, 'src', 'services'),
      Hook: path.join(__dirname, 'src', 'hooks'),
      Helpers: path.join(__dirname, 'src', 'helpers.ts'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
});

export const cleanOutputDir = (): Configuration => ({
  output: {
    clean: true,
  },
});

export const outputFilenames = (): Configuration => ({
  output: {
    assetModuleFilename: 'assets/[name].[contenthash][ext][query]',
    chunkFilename: '[name].[contenthash].js',
    filename: '[name].[contenthash].js',
  },
});

export const setFreeVariable = (key: string, value: unknown) => {
  const env: { [key: string]: string } = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [new DefinePlugin(env)],
  };
};
