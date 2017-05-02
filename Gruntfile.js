module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      files: ['test/**/*.js']
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['default']
    },
    jshint: {
      files: ['Gruntfile.js', 'tasks/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          curly: true,
          eqeqeq: true,
          immed: true,
          latedef: true,
          newcap: true,
          noarg: true,
          sub: true,
          undef: true,
          boss: true,
          eqnull: true,
          node: true,
          es5: true,
          strict: false
        }
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('test', ['nodeunit:files']);
  grunt.registerTask('default', ['jshint','test']);

};
