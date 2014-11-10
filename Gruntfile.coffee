module.exports = (grunt) ->

    # Project configuration.
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'

        coffee:
            compileJoined:
                options:
                    join: true
                files:
                    'js/flint_sdk.js': [
                        'src/flint_sdk/event_emitter.coffee'
                        'src/flint_sdk/discovery_api.coffee'
                        'src/flint_sdk/device_manager.coffee'
                        'src/flint_sdk/polyfill.coffee'
                    ]

        concat:
            dist:
                src: ['src/intro.js', 'src/project.js', 'src/outro.js'],
                dest: 'dist/built.js'

        uglify:
            options:
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            build:
                src: 'src/<%= pkg.name %>.js'
                dest: 'build/<%= pkg.name %>.min.js'

    # Load the plugin that provides the "coffee" task.
    grunt.loadNpmTasks 'grunt-contrib-coffee'

    # Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks 'grunt-contrib-uglify'

    # Default task(s).
    grunt.registerTask 'default', ['coffee', 'uglify']
