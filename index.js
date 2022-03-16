#! /usr/bin/env node
const fs = require('fs');
const appRoot = require('app-root-path');
const path = require('path');
const yargs = require("yargs");
const _ = require('lodash');
const listEndpoints = require('express-list-endpoints');
const { analyzeDependency } = require('express-router-dependency-graph');

const options = yargs
    .usage('route-list <absolute_app_file_path>')
    .option('p', { alias: 'path', describe: 'filter endpoints by path', type: 'string', demandOption: null })
    .option('m', { alias: 'method', describe: 'filter endpoints by method', type: 'string', demandOption: null })
    .option('w', { alias: 'middleware', describe: 'filter endpoints by middleware', type: 'string', demandOption: null })
    .option('r', { alias: 'routingFiles', describe: 'show routing files', type: 'boolen', demandOption: false })
    .option('d', { alias: 'detailedRoutingFiles', describe: 'show detailed routing files', type: 'boolen', demandOption: false })
    .help(true)
    .argv;

if (!yargs.argv._.length) throw 'missing app file path';

analyzeDependency({
    outputFormat: 'json',
    rootDir: appRoot.path,
    rootBaseUrl: '',
    includeOnly: '',
    doNotFollow: ['^node_modules']
}).then(results => {
    if (yargs.argv.routingFiles || yargs.argv.detailedRoutingFiles) {
        // Show routing files
        const maxRouteFileLength = Math.max(...(results.map(e => e.filePath.length))) - appRoot.path.length;
        console.table(
            results.map(e => {
                return {
                    routing_files: e.filePath.replace(appRoot.path, '').padEnd(maxRouteFileLength)
                };
            })
        );

        const pathsPerRouteFile = yargs.argv.detailedRoutingFiles ?
            results :
            results.filter( // // Remove routing file details (except method "use")
                e => e.routers.find(f => f.method === 'use')
            ).map(
                e => {
                    return { ...e, routers: e.routers.filter(f => f.method === 'use') }
                }
            );

        // Show routing files details
        pathsPerRouteFile.forEach(e => {
            console.log(e.filePath.replace(appRoot.path, ''));

            const fileRoutes = _.orderBy(e.routers, 'path');
            const maxPathLengthFile = Math.max(...(fileRoutes.map(e => e.path.length)));
            console.table(
                fileRoutes.map(e => { return { ...e, path: e.path.padEnd(maxPathLengthFile) } }),
                ['path', 'method', 'middlewares']
            );
        })
    }

    // Show endpoints list
    const appFile = path.join(appRoot.path, yargs.argv._[0]);
    if (!fs.existsSync(appFile)) throw `${appFile} not exists`;
    const server = require(appFile);
    let endpoints = listEndpoints(server);

    // filter endpoints
    if (yargs.argv.path) endpoints = endpoints.filter(e => e.path.includes(yargs.argv.p));
    if (yargs.argv.method) endpoints = endpoints.filter(e => e.methods.includes(yargs.argv.m));
    if (yargs.argv.middleware) endpoints = endpoints.filter(e => e.middlewares.includes(yargs.argv.w));

    const maxPathLength = Math.max(...(endpoints.map(e => e.path.length)));
    endpoints = endpoints.map(e => { return { ...e, path: e.path.padEnd(maxPathLength) } })
    console.table(_.orderBy(endpoints, 'path'))
})
