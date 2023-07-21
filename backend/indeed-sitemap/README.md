# indeed-sitemap

This lambda generates a sitemap xml for indeed to use. It stores the xml in a s3 bucket which is served by cloudfront on /indeed. This function is ran on a cron set in the stack config