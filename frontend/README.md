# Frontend

## Server side rendering

To achieve server side rendering, we have Next.js "pages" in the
`pages/` directory. Each of these corresponds to a route that will
respond when accessed directly, and the path to that page corresponds
to the directory structure within the `pages/` directory.

A package `next-aws-lambda-webpack-plugin`, configured in
`next.config.js`, and invoked using `make build` (via `npm run build`)
takes the pages, and the components the use, runs them through webpack
and spits out:
- some static files
- some lambdas (one per page)
- a shared lambda layer

into `.next/lambdaBuild`.

(There is then configuration in the top-level CDK code to take this and deploy it.)

### Using `getInitialProps`

To allow server side rendering to happen, we need to make the API
calls for a page before it is served to the browser. Note that we only
care about server-side rending of this data for _public_ data, so that
it can be seen by search engines, and can be cached for landing pages.

When configuring a page, also set `getInitialProps` as a static method
for that page, and use it to gather the props needed for that page
(eg, make and `await` API calls) and return the page's props.

### Persisting config on the browser

Config from the server side rendered Next pages needs to be passed to the Browser
and store such that it can be used in subsequent actions

On every call `_app.tsx's` `getInitialProps` checks whether the app is running in the
browser or on the server. If it is on server in fetches the config from environment
variables and uses them to make api calls. If the app is instead running in the
browser it instead stores the config on "window". From then onwards it receives the 
config from there. Since this is done in `_app` it happens on every page
automatically before that pages getInitialProps is called (because `_app` is the 
parent component of every page component).

The hope was also to store the config in state instead of on window but that
didn't happen because getInitialProps is static meaning it cannot access state.
