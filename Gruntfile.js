'use strict';

var utils = require('./lib/grunt/utils.js');

module.exports = function(grunt) {
    // Load all grunt tasks.
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Show elapsed time at the end.
    require('time-grunt')(grunt);

    var GEN_VERSION = utils.getVersion();
    var dist = 'generic-'+ GEN_VERSION.full;

    console.log('version:', GEN_VERSION.full);

    // Initialize.
    utils.init();

    // Config.
    grunt.initConfig({
        GEN_VERSION: GEN_VERSION,

        clean: {
            build: ['build'],
            tmp: ['tmp']
        },

        bower: {
            install: true
        },

        jslint: {
            core: {
                src: ['src/generic.js'],
                directives: {
                    browser: true,
                    plusplus: true,
                    predef: [
                        'console',
                        'require'
                    ]
                }
            },
            gens: {
                src: ['gens/**/*.js'],
                exclude: ['gens/**/plugins/**/*.js'],
                directives: {
                    browser: true,
                    plusplus: true,
                    predef: [
                        'console',
                        'define',
                        'require',
                        'gen'
                    ]
                }
            }
        },

        uglify: {
            core: {
                files: {
                    'build/generic.js': ['lib/requirejs/require.js', 'src/generic.js']
                }
            },
            std: {
                files: {
                    'build/generic-std.js': ['lib/requirejs/require.js', 'gens/std/plugins/**/*.js', 'gens/std/*.js', 'gens/std.js', 'src/generic.js']
                }
            },
            dev: {
                files: {
                    'build/generic.dev.js': ['lib/requirejs/require.js', 'gens/std/plugins/**/*.js', 'gens/std/*.js', 'gens/std.js', 'src/generic.js']
                },
                options: {
                    mangle: false,
                    beautify: true
                }
            }
        },

        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                commit: false,
                createTag: false,
                push: false
            }
        }
    });

    // Task aliases.
    grunt.registerTask('build', ['bower', 'clean', 'jslint', 'uglify', 'bump:build']);
    grunt.registerTask('default', ['build']);
};
