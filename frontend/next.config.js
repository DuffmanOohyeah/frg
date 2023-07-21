// eslint-disable-next-line @typescript-eslint/no-var-requires
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/* eslint-disable @typescript-eslint/explicit-function-return-type */

module.exports = () => ({
    target: 'server',
    // bug with image imports
    // https://stackoverflow.com/q/68008498
    images: {
        disableStaticImages: true,
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    webpack: (config, { isServer }) => {
        // adapted from https://github.com/vercel/next.js/blob/canary/packages/next-bundle-analyzer/index.js
        if (process.env.ANALYZE) {
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    analyzerPort: isServer ? 8888 : 8889,
                    reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
                }),
            );
        }

        config.module.rules.push({
            test: /\.(jpg|png|ico|svg)$/,
            use: {
                loader: 'file-loader',
                options: {
                    outputPath: 'static/images',
                    publicPath: '/_next/static/images',
                    name: '[name]_[hash].[ext]',
                },
            },
        });

        return config;
    },
    // Create rewrites that allow any language prefix that exists for any brand.
    // We will use code in the frontend to determine whether a brand actually has that language prefix or not!
    async rewrites() {
        return [
            // route index.html to the homepage as that is what cloudfront hits
            { source: `/index.html`, destination: '/' },
            { source: `/:lang(fr|de|it|pl|nl|es){/}?`, destination: '/' },
            { source: `/:lang(fr|de|it|pl|nl|es)/:path*{/}?`, destination: '/:path*?lang=:lang' },
        ];
    },
});
