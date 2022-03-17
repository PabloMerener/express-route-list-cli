#! /usr/bin/env node
const yargs = require("yargs");
const { showRoutingFiles, showEndpointList } = require('./utils');

yargs
    .usage('route-list <absolute_app_file_path>')
    .option('p', { alias: 'path', describe: 'filter endpoints by path', type: 'string', demandOption: null })
    .option('m', { alias: 'method', describe: 'filter endpoints by method', type: 'string', demandOption: null })
    .option('w', { alias: 'middleware', describe: 'filter endpoints by middleware', type: 'string', demandOption: null })
    .option('r', { alias: 'routingFiles', describe: 'show routing files', type: 'boolen', demandOption: false })
    .option('d', { alias: 'detailedRoutingFiles', describe: 'show detailed routing files', type: 'boolen', demandOption: false })
    .help(true)
    .argv;

if (yargs.argv._.length) {
    const relativeAppFilePath = yargs.argv._[0];

    (async () => {
        if (yargs.argv.routingFiles || yargs.argv.detailedRoutingFiles) await showRoutingFiles(yargs.argv.detailedRoutingFiles);

        showEndpointList(relativeAppFilePath, yargs.argv);
    })()
} else {
    throw 'missing app file path';
}
