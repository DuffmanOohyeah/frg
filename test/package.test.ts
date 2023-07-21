import * as fs from 'fs';
import { zipObj, groupBy, toPairs, filter, map, keys, length } from 'ramda';

type RawDependenciesList = Record<string, string>;
interface Dependency {
    name: string;
    version: string;
}
// A map of package name to version
type DependenciesList = Array<Dependency>;
// A map of version to packages with that version
type DependencyVersionGroups = Record<string, Array<Dependency>>;

const getDeps = (deps: RawDependenciesList): DependenciesList => {
    return (map(zipObj(['name', 'version']), toPairs(deps)) as unknown) as DependenciesList;
};

const getOnlyCDKDeps = (deps: DependenciesList): DependenciesList => {
    return filter((dep: Dependency): boolean => dep.name.startsWith('aws-cdk') || dep.name.startsWith('@aws-cdk/'), deps);
};

const getGroupedDeps = (deps: DependenciesList): DependencyVersionGroups => {
    return groupBy((dep: Dependency): string => dep.version, deps);
};

const getDepsVersions = (deps: RawDependenciesList): Array<string> => {
    const deps2 = getDeps(deps);
    const cdkDependencies = getOnlyCDKDeps(deps2);
    const groupedDependencies = getGroupedDeps(cdkDependencies);

    const versions = keys(groupedDependencies);
    return versions;
};

test('package.json has matching CDK versions', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json').toString('utf8'));

    const devDepsVersions = getDepsVersions(packageJson.devDependencies as RawDependenciesList);
    expect(length(devDepsVersions)).toEqual(1);

    const depsVersions = getDepsVersions(packageJson.dependencies as RawDependenciesList);
    expect(length(depsVersions)).toEqual(1);

    const devDepsVersion = devDepsVersions[0];
    const depsVersion = depsVersions[0];

    expect(devDepsVersion).toEqual(depsVersion);
    const version = depsVersion;

    const semverRegexp = /\d+\.\d+\.\d+/;
    expect(version).toEqual(expect.stringMatching(semverRegexp));

    console.log(`All CDK deps are at version ${version}`);
});
