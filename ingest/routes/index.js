"use strict";

const knownSchema = {};

module.exports = async (server, { hdbCore, logger }) => {
  // UPSERT endpoint
  // ensure provided schema and table names exist (create them if they don't)
  // ensure the request.body is JSON (parse it if not)
  // upsert the provided data
  server.route({
    url: "/upsert/:schema/:table",
    preValidation: async (req, res) => {
      try {
        const { authorization } = req.headers;
        const authHandler = hdbCore.preValidation[1];
        const _req = { body: {}, socket: {}, headers: { authorization } };
        await new Promise((resolve, reject) =>
          authHandler(_req, {}, (error) => {
            if (error) return reject(error);
            return resolve();
          })
        );
      } catch {
        return res.code(401).send("Unauthorized.");
      }
    },
    method: "POST",
    handler: async (request, response) => {
      let { body: data } = request;
      if (typeof data !== "object") {
        logger.info(
          "Received data is not an object. Attempting to parse request.body."
        );
        try {
          data = JSON.parse(data);
        } catch (error) {
          logger.error("Could not parse request.body");
          return response.code(500).send("Could not parse the request.body.");
        }
      }

      let { schema, table } = request.params;
      schema = schema.toLowerCase();
      table = table.toLowerCase();

      // schema check
      if (!knownSchema[schema]) {
        logger.info(
          `Schema ${schema} not in known-schema-cache. Attempting to create.`
        );
        try {
          await hdbCore.requestWithoutAuthentication({
            body: {
              operation: "create_schema",
              schema,
            },
          });
          logger.info(`Schema ${schema} created.`);
          await new Promise((r) => setTimeout(r, 500));
        } catch {
          logger.info(`Schema ${schema} already exists.`);
        }
        knownSchema[schema] = {};
      }

      // table check
      if (!knownSchema[schema][table]) {
        logger.info(
          `Table ${schema}.${table} not in known-schema-cache. Attempting to create.`
        );
        try {
          await hdbCore.requestWithoutAuthentication({
            body: {
              operation: "create_table",
              schema,
              table,
              hash_attribute: "id",
            },
          });
          await new Promise((r) => setTimeout(r, 500));
          logger.info(`Table ${schema}.${table} has been created.`);
        } catch {
          logger.info(`Table ${schema}.${table} already exists.`);
        }
        knownSchema[schema][table] = true;
      }

      // insert the data
      try {
        const records = [].concat(data);
        logger.info(`Upserting ${records.length} records.`);
        await hdbCore.requestWithoutAuthentication({
          body: {
            operation: "upsert",
            schema,
            table,
            records,
          },
        });
      } catch (error) {
        logger.error(`Could not upsert the data: ${error.message}`);
      }

      return response.code(200).send();
    },
  });
};
