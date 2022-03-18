const fs = require('fs');
const pathPackage = require('path');
const _ = require('lodash');
const { analyzeDependency } = require('express-router-dependency-graph');
const listEndpoints = require('express-list-endpoints');

const showRoutingFiles = async (detailedRoutingFiles = false) => {
    const results = await analyzeDependency({
        outputFormat: 'json',
        rootDir: process.cwd(),
        rootBaseUrl: '',
        includeOnly: '',
        doNotFollow: ['^node_modules']
    });

    // Show routing files
    const maxRouteFileLength = Math.max(...(results.map(e => e.filePath.length))) - process.cwd().length;
    console.table(results.map(e => { return { routing_files: e.filePath.replace(process.cwd(), '').padEnd(maxRouteFileLength) }; }));

    const pathsPerRouteFile = detailedRoutingFiles ?
        results :
        results // Remove routing file details (except method "use")
            .filter(e => e.routers.find(f => f.method === 'use'))
            .map(e => { return { ...e, routers: e.routers.filter(f => f.method === 'use') } });

    // Show routing files details
    pathsPerRouteFile.forEach(e => {
        console.log(e.filePath.replace(process.cwd(), ''));

        const fileRoutes = _.orderBy(e.routers.filter(e => e.path[0] === '/'), 'path');
        const maxPathLengthFile = Math.max(...(fileRoutes.map(e => e.path.length)));
        console.table(
            fileRoutes.map(e => { return { ...e, path: e.path.padEnd(maxPathLengthFile) } }),
            ['path', 'method', 'middlewares']
        );
    })
}

const showEndpointList = (relativeAppFilePath, { path, method, middleware }) => {
    // Show endpoints list
    const appFile = pathPackage.join(process.cwd(), relativeAppFilePath);
    if (!fs.existsSync(appFile)) throw `${appFile} not exists`;
    const app = require(appFile);
    let endpoints = listEndpoints(app);

    // filter endpoints
    if (path) endpoints = endpoints.filter(e => e.path.includes(path));
    if (method) endpoints = endpoints.filter(e => e.methods.includes(method));
    if (middleware) endpoints = endpoints.filter(e => e.middlewares.includes(middleware));

    const maxPathLength = Math.max(...(endpoints.map(e => e.path.length)));
    endpoints = endpoints.map(e => { return { ...e, path: e.path.padEnd(maxPathLength) } })
    console.table(_.orderBy(endpoints, 'path'))
}

module.exports = { showRoutingFiles, showEndpointList }