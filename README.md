# HarperDB JSON Ingest Custom Function

The is a [HarperDB](https://harperdb.io/) Custom Function to ingest JSON data in an automatic fashion, creating the necessary schema and tables on-the-fly.

## Setup

This [Custom Function](https://harperdb.io/docs/custom-functions/) can be deployed via the [HarperDB Studio](https://studio.harperdb.io/) or locally by cloning this repository into the `/custom_functions/` directory.

## How to Use

Create a POST request with JSON data to the [$HOST/ingest/:schema/:table]($HOST/ingest/:schema/:table) endpoint with the desired schema and table names. If the schema and/or table do not exist, they will be created.

**note:** the schema and table names are converted to lowercase.

Include the `Authorization: basic $token` header, with the token being the instance username and password base64 encoded (example `Buffer.from('${username}:${password}).toString('base64')`). The token can also be found on the Config page for the instance in the HarperDB Studio.

The `Content-Type: application/json` header is also recommended.

### Example cURL Reqest

```
curl -X POST http://localhost:9926/ingest/upsert/example/curls \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Basic b25lOuZW9uZQ==' \
    -d '{"dog":"harper", "breed": "yellow-lab"}'
```

## Development

To launch a development instance run `make dev`.

This will start HarperDB in a Docker container with the Ingest Custom Function mounted to the required directory.

### BASH

To access the BASH CLI to install new node modules for the Custom Function, run `make bash`
