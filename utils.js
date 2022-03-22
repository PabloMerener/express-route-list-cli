const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Table = require('tty-table');
const { analyzeDependency } = require('express-router-dependency-graph');
const listEndpoints = require('express-list-endpoints');

const showRoutingFiles = async (routingFiles, detailedRoutingFiles) => {
    const results = (await analyzeDependency({
        outputFormat: 'json',
        rootDir: process.cwd(),
        rootBaseUrl: '',
        includeOnly: '',
        doNotFollow: ['^node_modules']
    })).map(e => {
        return {
            ...e,
            filePath: e.filePath.replace(process.cwd(), '') // remove current path directory
        };
    });

    const options = { compact: true };

    // Show routing files
    console.log(
        Table(
            [{ value: "routing files", align: "left" }],                   // header
            results.map(e => { return { "routing files": e.filePath }; }), // rows
            options
        ).render()
    );

    const pathsPerRouteFile = detailedRoutingFiles ?
        results :
        results // Remove routing file details (except method "use")
            .filter(e => e.routers.find(f => f.method === 'use'))
            .map(e => { return { ...e, routers: e.routers.filter(f => f.method === 'use') } });

    // Show routing files details
    pathsPerRouteFile.forEach(e => {
        const header = [
            { value: "path", align: "left" },
            { value: "method" },
            { value: 'middlewares' }
        ];
        const rows = _.orderBy(e.routers.filter(e => e.path[0] === '/'), 'path');
        console.group('');
        console.log(e.filePath);

        // Remove middlewares column when it has no values
        if (_.uniq(_.map(rows, 'middlewares')).filter(e => e.length).length === 0) {
            header.pop();
        }

        console.log(Table(header, rows, options).render());
        console.groupEnd();
    })
}

const showEndpointList = (relativeAppFilePath, argvPath, argvMethod, argvMiddleware) => {
    const appFile = path.join(process.cwd(), relativeAppFilePath);

    if (fs.existsSync(appFile)) {
        const app = require(appFile);

        const endpoints = listEndpoints(app).filter(e =>
            (argvPath && e.path.includes(argvPath) || !argvPath) &&
            (argvMethod && e.methods.includes(argvMethod) || !argvMethod) &&
            (argvMiddleware && e.middlewares.includes(argvMiddleware) || !argvMiddleware)
        );

        const header = [
            { value: "path", align: "left" },
            { value: "methods" },
            { value: 'middlewares' }
        ];
        const rows = _.orderBy(endpoints, 'path');

        console.log(Table(header, rows, { compact: true }).render());
    } else {
        throw `File ${appFile} not exists`;
    }
}

module.exports = { showRoutingFiles, showEndpointList }