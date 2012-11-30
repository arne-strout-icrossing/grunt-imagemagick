/*
 * grunt-imagemagick
 * https://github.com/icagstrout/grunt-imagemagick
 *
 * Copyright (c) 2012 Arne Strout
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('imagemagick-responsive', 'Performs a number of configured tasks', function() {
    var done = this.async();
    grunt.log.write("Beginning Image Magick processing...");

    var fls=grunt.file.expand(this.data.files);
    var i=0;
    for(i=0;i<fls.length;i++){
      
    }
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('imagemagick-resize', function() {
    return '';
  });

};
