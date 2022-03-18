#! /usr/bin/env node
const yargs = require("yargs");
const { showRoutingFiles, showEndpointList } = require('./utils');

const argv = yargs
    .usage('route-list <absolute_app_file_path>')
    .option('p', { alias: 'path', describe: 'filter endpoints by path', type: 'string', demandOption: null })
    .option('m', { alias: 'method', describe: 'filter endpoints by method', type: 'string', demandOption: null })
    .option('w', { alias: 'middleware', describe: 'filter endpoints by middleware', type: 'string', demandOption: null })
    .option('f', { alias: 'routingFiles', describe: 'show routing files', type: 'boolen', demandOption: false })
    .option('r', { alias: 'routingFiles', describe: 'show routing files (Deprecated)', type: 'boolen', demandOption: false })
    .option('d', { alias: 'detailedRoutingFiles', describe: 'show detailed routing files', type: 'boolen', demandOption: false })
    .help(true)
    .argv;

if (argv._.length) {
    const relativeAppFilePath = argv._[0];

    (async () => {
        if (argv.routingFiles || argv.detailedRoutingFiles) await showRoutingFiles(argv.detailedRoutingFiles);

        showEndpointList(relativeAppFilePath, argv);
    })()
} else {
    throw 'missing app file path';
}
