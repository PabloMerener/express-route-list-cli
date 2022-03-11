#! /usr/bin/env node
const fs = require('fs');
const appRoot = require('app-root-path');
const path = require('path');
const yargs = require("yargs");
const _ = require('lodash');
const listEndpoints = require('express-list-endpoints');

const options = yargs
    .usage('route-list <absolute_app_file_path>')
    .option('p', { alias: 'path', describe: 'filter endpoints by path', type: 'string', demandOption: null })
    .option('m', { alias: 'method', describe: 'filter endpoints by method', type: 'string', demandOption: null })
    .option('w', { alias: 'middleware', describe: 'filter endpoints by middleware', type: 'string', demandOption: null })
    .help(true)
    .argv;

if (!yargs.argv._.length) throw 'missing app file path';

const appFile = path.join(appRoot.path, yargs.argv._[0]);

if (!fs.existsSync(appFile)) throw `${appFile} not exists`;

const server = require(appFile);

let endpoints = listEndpoints(server);

// filter by args (path; method; middleware)
if (yargs.argv.p) endpoints = endpoints.filter(e => e.path.includes(yargs.argv.p));
if (yargs.argv.m) endpoints = endpoints.filter(e => e.methods.includes(yargs.argv.m));
if (yargs.argv.w) endpoints = endpoints.filter(e => e.middlewares.includes(yargs.argv.w));

console.table(_.orderBy(endpoints, 'path'))
return;
