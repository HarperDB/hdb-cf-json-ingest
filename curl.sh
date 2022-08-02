curl -X POST http://localhost:9926/ingest/upsert/example/curls \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Basic b25lOuZW9uZQ==' \
    -d '{"dog":"harper", "breed": "yellow-lab"}'
    