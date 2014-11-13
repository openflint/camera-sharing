module.exports = (grunt) ->

    # Project configuration.
    grunt.initConfig
        pkg: grunt.file.readJSON 'package.json'

        browserify:

            sender:
                files:
                    'js/flint_sender_sdk.js': ['lib/flint_sender_sdk/exports.coffee']
                options:
                    transform: ['coffeeify']
                    browserifyOptions:
                        extensions: ['.coffee']

            receiver:
                files:
                    'js/flint_receiver_.js': ['lib/flint_receiver_sdk/exports.coffee']
                options:
                    transform: ['coffeeify']
                    browserifyOptions:
                        extensions: ['.coffee']

        uglify:

            sender:
                options: { mangle: true, compress: true }
                src: 'js/flint_sender_sdk.js'
                dest: 'js/flint_sender_sdk.min.js'

            receiver:
                options: { mangle: true, compress: true }
                src: 'js/flint_receiver_sdk.js'
                dest: 'js/flint_receiver_sdk.min.js'

        concat:

            sender:
                options:
                    banner: '/*! <%= pkg.name %> build:<%= pkg.version %>, development. '+
                        'Copyright(C) 2013-2014 www.OpenFlint.org */'
                src: 'js/flint_sender_sdk.js'
                dest: 'js/flint_sender_sdk.js'

            sender_prod:
                options:
                    banner: '/*! <%= pkg.name %> build:<%= pkg.version %>, production. '+
                        'Copyright(C) 2013-2014 www.OpenFlint.org */'
                src: 'js/flint_sender_sdk.min.js'
                dest: 'js/flint_sender_sdk.min.js'

            receiver:
                options:
                    banner: '/*! <%= pkg.name %> build:<%= pkg.version %>, development. '+
                        'Copyright(C) 2013-2014 www.OpenFlint.org */'
                src: 'js/flint_receiver_sdk.js'
                dest: 'js/flint_receiver_sdk.js'

            receiver_prod:
                options:
                    banner: '/*! <%= pkg.name %> build:<%= pkg.version %>, production. '+
                        'Copyright(C) 2013-2014 www.OpenFlint.org */'
                src: 'js/flint_receiver_sdk.min.js'
                dest: 'js/flint_receiver_sdk.min.js'

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