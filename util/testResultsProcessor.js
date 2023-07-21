const fs = require('fs');
const path = require('path');

const getCoverageLineValue = (body, configName) => {
    const reg = `\\s+${configName}: (\\d+),`;
    const found = body.match(new RegExp(reg));
    if (found && found[1]) {
        return parseInt(found[1], 10)
    }
    throw new Error(`Unable to load value for ${configName}`);
};

const setCoverageLineValue = (body, configName, newValue) => {
    const reg = `${configName}: \\d+,`;
    return body.replace(new RegExp(reg), `${configName}: ${newValue},`);
};

const process = (results) => {
    const summary = results.coverageMap.getCoverageSummary();
    const body = fs.readFileSync('jest.config.js', 'utf8');
    const confStatements = getCoverageLineValue(body, 'statements');
    const confBranches = getCoverageLineValue(body, 'branches');
    const confFunctions = getCoverageLineValue(body, 'functions');
    const confLines = getCoverageLineValue(body, 'lines');

    const covStatements = Math.floor(summary.statements.pct);
    const covBranches = Math.floor(summary.branches.pct);
    const covFunctions = Math.floor(summary.functions.pct);
    const covLines = Math.floor(summary.lines.pct);

    let newBody = body;

    if (covStatements > confStatements) {
        newBody = setCoverageLineValue(newBody, 'statements', covStatements);
    }
    if (covBranches > confBranches) {
        newBody = setCoverageLineValue(newBody, 'branches', covBranches);
    }
    if (covFunctions > confFunctions) {
        newBody = setCoverageLineValue(newBody, 'functions', covFunctions);
    }
    if (covLines > confLines) {
        newBody = setCoverageLineValue(newBody, 'lines', covLines);
    }

    fs.writeFileSync('jest.config.js', newBody);

    return results;
};

module.exports = process;
