# Candidate profile api

This directory contains a lambda function that uses the shared lambda handler.
It is an api for the candidates profile and will talk to phoenix, store user
data in s3 if they are not verified and parse cv's

# Handlers

## Daxtra parser

When called it takes a file that is already in S3, passes that file to the
Daxtra API to parse it. Daxtra returns a json string with this schema
https://cvxdemo.daxtra.com/cvx/cvx_schema/candidate/2.0.37/Resume.json
It then marshals the result for returning to the client.

### field

this is the handler - `'parseCV'`

### args

this is the key in the s3 bucket for the cv you want to upload
