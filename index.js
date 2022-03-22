#! /usr/bin/env node
const yargs = require("yargs");
const { showRoutingFiles, showEndpointList } = require('./utils');

const { argv } = yargs
    .usage('route-list <absolute_app_file_path>')
    .option('p', { alias: 'path', describe: 'filter endpoints by path', type: 'string', demandOption: null })
    .option('m', { alias: 'method', describe: 'filter endpoints by method', type: 'string', demandOption: null })
    .option('w', { alias: 'middleware', describe: 'filter endpoints by middleware', type: 'string', demandOption: null })
    .option('f', { alias: 'routingFiles', describe: 'show routing files', type: 'boolen', demandOption: false })
    .option('r', { alias: 'routingFiles', describe: 'show routing files (Deprecated)', type: 'boolen', demandOption: false })
    .option('d', { alias: 'detailedRoutingFiles', describe: 'show detailed routing files', type: 'boolen', demandOption: false })
    .help(true);

const relativeAppFilePath = argv._.length ? argv._[0] : null;

(async (relativeAppFilePath, { path, method, middleware, routingFiles, detailedRoutingFiles }) => {
    if (routingFiles || detailedRoutingFiles) await showRoutingFiles(routingFiles, detailedRoutingFiles);

    if (relativeAppFilePath || path || method || middleware) {
        if (relativeAppFilePath) {
            showEndpointList(relativeAppFilePath, path, method, middleware);
        } else {
            throw 'missing app file path';
        }
    } else if (!routingFiles && !detailedRoutingFiles) {
        throw 'At least one of the following parameters is required: <relative app file path>, -f or -d';
    }
})(relativeAppFilePath, argv)
    .catch(error => console.log(
        'Documentation: https://github.com/PabloMerener/express-route-list-cli \n'
        + 'Help: npx route-list --help \n\n'
        + error
    ));