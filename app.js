/* Imports */
const config = require("./config.json");
const knex = require("knex")(config.database);
const aws = require("aws-sdk");
const log4js = require("log4js");
const logger = log4js.getLogger();
const query = require("./query");

/* Constants */
const TIMEOUT_MS = 10000;
const PERIOD_MS = 1000;

logger.info("Loading aws credentials");
aws.config.loadFromPath("./credentials.json");
const http = new aws.HttpClient();

/* Send data to AWS api Gateway */
let sendData = (body) => {
    const request = new aws.HttpRequest(config.endpoint.url, aws.config.region);
    request.method = "POST";
    request.body = body;

    /* Perform request */
    return new Promise(function (resolve, reject) {
        http.handleRequest(request, {}, (success) => {
            resolve(success);
        }, (err) => {
            reject(err);
        });
    });
};

/* Get data from database */
let processDataAsync = () => {
    knex.raw(query.dbReadQuery, [`2015-08-25T07:00:00.000Z`]
    ).then((data) => {
        logger.debug(`data successfully retrieved from the database [rows = ${data.rows.length}]`);
        return sendData("my data");
    }, (err) => {
        logger.error("could not fetch data from database", err);
        setTimeout(processDataAsync, TIMEOUT_MS);
    }).then(() => {
        logger.debug("aws request succeeded");
        setTimeout(processDataAsync, PERIOD_MS);
    }, (err) => {
        logger.error("could not send data to aws", err);
        setTimeout(processDataAsync, TIMEOUT_MS);
    });
};

/* Invoke processData */
logger.info(`Starting background process [ period = ${PERIOD_MS}, timeout = ${TIMEOUT_MS}]`);
processDataAsync();
