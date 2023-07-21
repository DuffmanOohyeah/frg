/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const authValid = req => {
    if (!process.env.ENABLE_HTTP_BASIC_AUTH) {
        return true;
    }

    const configuredUsername = process.env.HTTP_BASIC_AUTH_USERNAME;
    const configuredPassword = process.env.HTTP_BASIC_AUTH_PASSWORD;

    if (!(configuredUsername && configuredPassword)) {
        return false;
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return false;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return false;
    }

    if (parts[0] !== 'Basic') {
        return false;
    }

    const digest = parts[1];
    const plainText = Buffer.from(digest, 'base64').toString();

    if (plainText !== `${configuredUsername}:${configuredPassword}`) {
        return false;
    }

    return true;
};

app.prepare().then(() => {
    createServer((req, res) => {
        // Set security headers
        res.setHeader('Strict-Transport-Security', 'max-age=16070400; includeSubDomains');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Reactful request -> NGW-1935
        res.setHeader(
            'Content-Security-Policy',
            [
                // This makes me sad but is basically because of the disqus plugin on blog posts
                // and prefetch-src throwing a wobbly in chrome
                "default-src 'self' https://disqus.com/ https://*.disquscdn.com 'unsafe-eval'",
                "img-src * data: 'unsafe-eval'",
                "style-src 'unsafe-inline'  *.typekit.net",
                'font-src *',
                // unsafe-inline because of script tags being pulled in on wordpress pages :/
                // Hash for livechat snippet is 'sha256-zFVyLiGnvE5vULb35y7gZ3WDSb7+I3uWRsWuCzxn9tg='
                // If we can ever get rid of 'unsafe-inline'
                // eslint-disable-next-line max-len
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.driftt.com https://*.disqus.com https://*.disquscdn.com https://*.twitter.com *.pardot.com https://*.onetrust.com *.jeffersonfrank.com *.nelsonfrank.com *.andersonfrank.com *.frankgroup.com *.masonfrank.com *.washingtonfrank.com *.nigelfrank.com *.frgconsulting.com https://*.googletagmanager.com https://www.google-analytics.com https://snap.licdn.com https://*.hotjar.com https://*.hotjar.io http://www.googleadservices.com https://connect.facebook.net http://static.ads-twitter.com https://googleads.g.doubleclick.net *.google.com *.hotjar.com http://*.6sc.co https://jscloud.net/x/11306/inlinks.js https://jscloud.net/x/11310/inlinks.js https://jscloud.net/lze/11308/inlinks.js https://jscloud.net/x/11309/inlinks.js https://jscloud.net/x/11289/inlinks.js https://jscloud.net/lze/11311/inlinks.js https://jscloud.net/x/11307/inlinks.js *.reactful.com http://widget.trustpilot.com blob:",
                // eslint-disable-next-line max-len
                'frame-src https://*.driftt.com https://disqus.com https://*.twitter.com https://*.youtube.com  https://*.youtube-nocookie.com/ https://*.vimeo.com https://*.instagram.com https://*.googleapis.com https://*.gstatic.com https://*.pardot.com https://*.onetrust.com *.jeffersonfrank.com *.nelsonfrank.com *.andersonfrank.com *.frankgroup.com *.masonfrank.com *.nigelfrank.com *.washingtonfrank.com *.frgconsulting.com https://www.facebook.com https://vars.hotjar.com *.reactful.com https://widget.trustpilot.com',
                // eslint-disable-next-line max-len
                "connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com *.pardot.com https://*.onetrust.com *.jeffersonfrank.com *.nelsonfrank.com *.andersonfrank.com *.frankgroup.com *.masonfrank.com *.nigelfrank.com *.washingtonfrank.com *.frgconsulting.com https://*.disqus.com *.facebook.com http://*.6sc.co http://ib.adnxs.com/getuidj https://epsilon.6sense.com http://secure.adnxs.com/getuidj http://visitor.reactful.com https://visitor.reactful.com https://jscloud.net/x/11306/ https://jscloud.net/x/11310/ https://jscloud.net/x/11309/ https://jscloud.net/x/11289/ https://jscloud.net/x/11307/ https://*.doubleclick.net *.hotjar.com *.hotjar.io *.hotjar.is *.reactful.com *.google-analytics.com *.analytics.google.com",
            ].join(';'),
        );
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

        if (process.env.DENY_ROBOTS) {
            res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        }

        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const parsedUrl = parse(req.url, true);
        if (parsedUrl.path === '/_healthz') {
            res.writeHead(200, {
                'Content-Type': 'text/plain',
            });
            res.write('ok');
            res.end();
        } else if (!authValid(req)) {
            res.writeHead(401, {
                'Content-Type': 'text/html',
                'WWW-Authenticate': 'Basic realm="FRG"',
            });
            res.write(
                [
                    '<html>',
                    '<title>Auth required</title>',
                    '<body><h1>Authorization Required</h1></body>',
                    '</html>',
                ].join(''),
            );
            res.end();
        } else {
            handle(req, res, parsedUrl);
        }
    }).listen(3000, err => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
