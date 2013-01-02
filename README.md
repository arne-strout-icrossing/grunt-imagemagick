# grunt-imagemagick

Adds utility tasks for grunt to access ImageMagick via the node_imagemagick package.
You will need to have image magick CLI tools installed as described in the node_imagemagick readme.
see [node-imagemagick](https://github.com/rsms/node-imagemagick)

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-imagemagick`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-imagemagick');
```

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md

## Documentation
_Example Usage_
```javascript
grunt.initConfig({
	"imagemagick-hisrc":{
	  dev:{
	    files:"**/*-2x.jpg",
	    suffix:["-2x","-1x","-low"],
	  }
	},"imagemagick-resize":{
	  dev:{
	    from:'test/',
	    to:'test/resized/',
	    files:'resizeme.jpg',
	    props:{
	      width:100
	    }
	  }
	},"imagemagick-convert":{
	  dev:{
	    args:['test/resizeme.jpg','-resize', '25x25', 'test/resized/resizeme-small.jpg']
	  }
	}
});
```
# Tasks
__imagemagick-convert__
Use the _args_ property to identify the list of arguments to pass to ImageMagick's convert command.

__imagemagick-resize__
The following properties are valid:
* _from_ : The path where images will be pulled from.
* _to_ : The output path for the resized images.
* _files_ : The wildcard identifying the files to resize.
* _props_ : The properties to pass to the node_imagemagick "resize" method. See [node-imagemagick](https://github.com/rsms/node-imagemagick)

__imagemagick-hisrc__
This is a little utility task which runs over a set of image files and creates three sizes of each using a specified naming convention. This is great for auto-generating the three image sizes accepted by HiSRC.
The following properties are valid:
* _files_ : A wildcard identifying the files to resize, this should be a wildcard for the source image, which should be the full size retina image (2X)
* _suffix_ : An array of suffixes to use. The first is the suffix for the large image, the second and third are the medium (normal) and small respectively. The assumption is that the source image follows the identified convention.

If you have any questions, feel free to ask, if you have any ideas, feel free to contribute a pull :)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History
_0.1.4_ First functional build on NPM
_0.1.5_ Added documentation

## License
Copyright (c) 2012 Arne Strout  
Licensed under the MIT license.
