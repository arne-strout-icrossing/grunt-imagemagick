var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['imagemagick'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'helper': function(test) {
    test.expect(1);
    // tests here
    try{
      var grunt = require('grunt');
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
      grunt.loadTasks('tasks');
      grunt.task.run('imagemagick-hisrc imagemagick-resize imagemagick-convert');
      test.ok(true,"Works");
    }catch(e){
      test.ok(false,"Broken:["+e+"]");
    }
    test.done();
  }
};
