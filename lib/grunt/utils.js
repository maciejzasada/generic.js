var fs = require('fs');
var shell = require('shelljs');
var version;

module.exports = {

    init: function() {
        if (!process.env.TRAVIS) {
            shell.exec('npm install');
        }
    },

    getVersion: function(){
        if (version) return version;

        var package = JSON.parse(fs.readFileSync('package.json', 'UTF-8'));
        var match = package.version.match(/^([^\-]*)(?:\-(.+))?$/);
        var semver = match[1].split('.');

        var fullVersion = match[1];

        if (match[2]) {
            fullVersion += '-';
            fullVersion += (match[2] == 'snapshot') ? getSnapshotSuffix() : match[2];
        }

        version = {
            full: fullVersion,
            major: semver[0],
            minor: semver[1],
            dot: semver[2].replace(/rc\d+/, ''),
            codename: package.codename
        };

        return version;
    }

};