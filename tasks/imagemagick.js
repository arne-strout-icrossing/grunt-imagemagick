/*
 * grunt-imagemagick
 * https://github.com/icagstrout/grunt-imagemagick
 *
 * Copyright (c) 2012 Arne Strout
 * Licensed under the MIT license.
 */

var grunt=require('grunt');
var ResizeCommand={
  path:'',
  name:'',
  ext:'',
  file:'',
  callback:undefined,
  context:undefined,
  im:undefined,
  init:function (fpath,fsuffix,fcallback,context){
    try{
      this.file=fpath;
      this.suffix=fsuffix;
      var lslash=fpath.lastIndexOf('/');
      var ldot=fpath.lastIndexOf('.');
      this.path=fpath.substr(0,lslash+1);
      this.ext=fpath.substr(ldot+1);
      this.name=fpath.substr(lslash+1,ldot-lslash-1);
      this.im=require('node-imagemagick');
      this.callback=fcallback;

      this.im.identify(['-format','%wx%h',this.file],this.proxy(this.resize,this));
    }catch(e){
      grunt.log.write('error '+e+"\n");
    }
  },
  resize: function(err,output){
    try{
    grunt.log.write("Resizing image: "+output+"\n");
    this.baseWidth=Number(output.split('x')[0]);
    this.baseHeight=Number(output.split('x')[1]);
    grunt.log.write("To size: "+Math.round(this.baseWidth/2)+"x"+Math.round(this.baseHeight/2)+"\n");
    this.im.resize({
      width:Math.round(this.baseWidth/2),
      height:Math.round(this.baseHeight/2),
      srcPath: this.file,
      dstPath: this.path + this.name.split(this.suffix[0]).join(this.suffix[1]) +'.'+this.ext
    },this.proxy(this.resize2,this));
    } catch (e){
      grunt.log.write('error '+e+"\n");
    }
  },
  resize2: function(err){
    try{
    grunt.log.write("Resizing lowrez\n");
    grunt.log.write("To size: "+Math.round(this.baseWidth/4)+"x"+Math.round(this.baseHeight/4)+"\n");
    this.im.resize({
      width:Math.round(this.baseWidth/4),
      height:Math.round(this.baseHeight/4),
      srcPath: this.file,
      dstPath: this.path + this.name.split(this.suffix[0]).join(this.suffix[2]) +'.'+this.ext
    },this.proxy(this.complete,this));
    } catch (e){
      grunt.log.write('error '+e+"\n");
    }
  },
  complete:function(){
    grunt.log.write(" - created responsive for "+this.path + this.name +"."+this.ext+"\n");
    this.callback.apply(this.context,[this]);
  },
  proxy:function(f,c){
    var fn=f;
    var cn=c;
    return function(){
      fn.apply(cn,Array.prototype.slice.call(arguments));
    };
  }
};

module.exports = function(grunt) {
  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================
  /*
   * imagemagick-hisrc TASK
   * takes a file identification expression (usually with wildcards) to create a list of files
   * iterates over the files to generate 1/2 and 1/4 size alternatives for mobile.
   * uses the filename pattern specified in the "pattern" property to save the files.
   */
  grunt.registerMultiTask('imagemagick-hisrc', 'Performs a number of configured tasks', function() {
    var done = this.async();
    grunt.log.write("Beginning ImageMagick processing for HiSRC\n");

    var fls=grunt.file.expand(this.data.files);
    var i=0;
    var count=fls.length;
    var pattern=this.data.pattern;
    var cmds=[];
    var cmd;

    grunt.log.write("CWD:"+process.cwd()+"\n-files:"+fls.length+"\n-pattern:"+this.data.files+"\n");

    function onCmdComplete(cmd,success){
      grunt.log.write("completed : "+cmd.file+"\n");
      cmds.splice(cmds.indexOf(cmd),1);
      if(cmds.length<1){
        done();
      }
    }

    for(i=0;i<fls.length;i++){
      cmd = Object.create(ResizeCommand);
      cmds.push(cmd);
      cmd.init(fls[i],this.data.suffix,onCmdComplete,this);
    }
    if(fls.length<1){
      grunt.log.write("Nothing to do\n");
      done();
    }else{
      grunt.log.write("all queued\n");
    }
  });


  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('imagemagick-resize', function() {
    return '';
  });

};
