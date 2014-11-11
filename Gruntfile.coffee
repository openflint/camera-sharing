module.exports = (grunt) ->

    # Project configuration.
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'

        browserify:
            dist:
                files:
                    'dist/flint.js': ['lib/exports.coffee']
                options:
                    transform: ['coffeeify']
                    browserifyOptions:
                        extensions: ['.coffee']

        uglify:
            prod:
                options: { mangle: true, compress: true }
                src: 'dist/flint.js'
                dest: 'dist/flint.min.js'

        concat:
            dev:
                options:
                    banner: '/*! <%= pkg.name %> build:<%= pkg.version %>, development. '+
                        'Copyright(C) 2013-2014 www.OpenFlint.org */'
                src: 'dist/flint.js'
                dest: 'dist/flint.js'
            prod:
                options:
                    banner: '/*! <%= pkg.name %> build:<%= pkg.version %>, production. '+
                        'Copyright(C) 2013-2014 www.OpenFlint.org */'
                src: 'dist/flint.min.js'
                dest: 'dist/flint.min.js'

    # Load the plugin that provides the "coffee" task.

    # Load the plugin that provides the "uglify" task.
    # grunt.loadNpmTasks 'grunt-contrib-uglify'

    # Default task(s).
    # grunt.registerTask 'default', ['coffee', 'uglify']

    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-browserify'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-concat'

    grunt.registerTask 'default', ['browserify', 'uglify', 'concat']