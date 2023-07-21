# Search

The goal of this Lambda codebase is to handle the "public" parts of
the API (other than the CMS content), eg job and candidate searching.

It may well come to share code with other parts of the system (ie, the
"private" parts of the API, like applying for jobs), but that should
happen via a shared Typescript package, rather than having one big
Lambda that tries to do everything.
