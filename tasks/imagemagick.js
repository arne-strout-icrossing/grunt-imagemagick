/*
 * grunt-imagemagick
 * https://github.com/icagstrout/grunt-imagemagick
 *
 * Copyright (c) 2012 Arne Strout
 * Licensed under the MIT license.
 */

var grunt=require('grunt');
var fs=require('fs');
var path=require('path');
/** Quick Proxy methods **/
var proxy=function(f,c){
  var fn=f;
  var cn=c;
  return function(){
    fn.apply(cn,Array.prototype.slice.call(arguments));
  };
};
// True if the file path exists.
var fileExists = function() {
  var filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
};
/****
* HisrcCommand - Command which asynchronously generates all sizes for a large image for use with HiSRC.js
* This command assumes that suffix is an array of suffixes in the order [{FULL}, {1/2}, {1/4}].
* for example, a typical use is suffix:['-2x','-1x','-low'] with files: '{PATH}*-2x.jpg'. The actual file
* provided should always be the retina image (eg: 2X) but you can use whatever suffixes you wish.
**/
var HisrcCommand={
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

      this.im.identify(['-format','%wx%h',this.file],proxy(this.resize,this));
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
    },proxy(this.resize2,this));
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
    },proxy(this.complete,this));
    } catch (e){
      grunt.log.write('error '+e+"\n");
    }
  },
  complete:function(){
    grunt.log.write(" - created responsive for "+this.path + this.name +"."+this.ext+"\n");
    this.callback.apply(this.context,[this,true]);
  },
};

/**
* ResizeCommand
* resizes the specified images or groups of images using the specified parameters
* currently uses the same properties as node-imagemagick 
**/
var ResizeCommand={
  props:undefined,
  callback:undefined,
  context:undefined,
  im:undefined,
  init:function(pfrom,pto,pprops,pcallback,pcontext){
    
    this.props=Object.create(pprops);
    this.props.srcPath=pfrom;
    this.props.dstPath=pto;
    this.callback=pcallback;
    this.context=pcontext;
    this.im=require('node-imagemagick');

    grunt.log.write('resizing:'+this.props.srcPath+"...\n");
    this.im.resize(this.props,proxy(this.complete,this));
  },
  complete:function(err){
    grunt.log.write('created '+this.props.dstPath+'--'+err+"\n");
    this.callback.apply(this.context,[this,true]);
  }
};

/**
* ConvertCommand
* raw interface to the convert command in imagemagick
* accepts an array of command line arguments
**/
var ConvertCommand={
  args: undefined,
  callback: undefined,
  context: undefined,
  im: undefined,
  init:function(pArgs,pCallback,pContext){
    this.args=pArgs;
    this.callback=pCallback;
    this.context=pContext;
    this.im=require('node-imagemagick');

    grunt.log.write('convert: '+this.args+"...\n");
    this.im.convert(this.args,proxy(this.complete,this));
  },
  complete:function(err){
    grunt.log.write('convert complete...'+"\n"+err+"\n");
    this.callback.apply(this.context,[this,true]);
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
   * uses the filename pattern specified in the "suffix" property to save the files.
   */
  grunt.registerMultiTask('imagemagick-hisrc', 'Performs a number of configured tasks', function() {
    var done = this.async();
    grunt.log.write("Beginning ImageMagick processing for HiSRC\n");

    var fls=grunt.file.expand(this.data.files);
    var i=0;
    var count=fls.length;
    var suffix=this.data.suffix;
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
      cmd = Object.create(HisrcCommand);
      cmds.push(cmd);
      cmd.init(fls[i],suffix,onCmdComplete,this);
    }
    if(fls.length<1){
      grunt.log.write("Nothing to do\n");
      done();
    }else{
      grunt.log.write("all queued\n");
    }
  });

  /*
  * imagemagick-resize TASK
  * takes a from folder, a to folder, a file pattern, and properties, and resizes the matching
  * files, outputting the resized images to the "to" folder.
  * {from:"folder",to:"folder",files:"*.ext",props{width:100}} etc.
  */
  grunt.registerMultiTask('imagemagick-resize','Resizes images using imagemagick',function(){
    var done= this.async();
    grunt.log.write("Beginning ImageMagick resizing process\n");
    var cmds=[],cmd;
    var i=0;
    var fls=grunt.file.expand(this.data.from+this.data.files);

    function onCmdComplete(cmd,success){
      grunt.log.write("completed:"+cmd.dstPath+"\n");
      cmds.splice(cmds.indexOf(cmd),1);
      if(cmds.length<1){
        done();
      }
    }

    if(!fileExists(this.data.to)){
      grunt.file.mkdir(this.data.to);
    }

    for(i=0;i<fls.length;i++){
      cmd=Object.create(ResizeCommand);
      cmds.push(cmd);
      cmd.init(
        fls[i],
        this.data.to+fls[i].substr(this.data.from.length), // replace folder
        this.data.props,
        onCmdComplete,
        this
      );
    }

    if(fls.length<1){
      grunt.log.write("Nothing to do\n");
      done();
    }else{
      grunt.log.write("all queued\n");
    }
  });

  grunt.registerMultiTask('imagemagick-convert','Converts images using imagemagick',function(){
    var done=this.async();
    grunt.log.write("Beginning convert operation\n");
    var cmd=Object.create(ConvertCommand);
    function onCmdComplete(cmd,success){
      grunt.log.write("completed:"+cmd.args+"\n");
      done();
    }
    cmd.init(this.data.args,onCmdComplete,this);
  });
};
