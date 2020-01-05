
// how to make the drawing
/*
 * Some comments quoted from WebGL Programming Guide
 * by Matsuda and Lea, 1st edition.
 *
 * @author Joshua Cuneo
 */

var gl;
var program;
var canvas;

var theta = 0;
var alpha = 0;
var vertices = [];
var polygons = [];
var points = [];
var normals = [];
var colors = [];

//perspective stuff
var tp;
var bottom;
var r;
var l;
var near;
var far;

var tx = 0;
var ty = 0;
var tz = 0;




function main()
{



	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	gl = WebGLUtils.setupWebGL(canvas, undefined);
	if (!gl)
	{
		//console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders
	// This function call will create a shader, upload the GLSL source, and compile the shader
	program = initShaders(gl, "vshader", "fshader");

	// We tell WebGL which shader program to execute.
	gl.useProgram(program);

	//Set up the viewport
	//x, y - specify the lower-left corner of the viewport rectangle (in pixels)
	//In WebGL, x and y are specified in the <canvas> coordinate system
	//width, height - specify the width and height of the viewport (in pixels)
	//canvas is the window, and viewport is the viewing area within that window
		//This tells WebGL the -1 +1 clip space maps to 0 <-> gl.canvas.width for x and 0 <-> gl.canvas.height for y
	gl.viewport( 0, 0, canvas.width, canvas.height );



  function readFile() {
    // We process the data in the file
    var fileInput = document.getElementById('fileInput');
    var inputDiv = document.getElementById('inputDiv');
    fileInput.addEventListener('change', function (e) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      vertices = [];
      colors = [];
      polygons = [];
      points = [];
      normals = [];
      var file = fileInput.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
          var data = reader.result.split(/\r\n?|\n/);
          if (data[0] !== "ply") {
            alert('File does not contain "ply"');
          } else {

            // number of vertices
            var nrVerticesArr = data[2].match(/\d+/).map(function (v) {
              return parseInt(v);
            });
            var nrVertices = nrVerticesArr[0];

            // number of polygons
            var nrPolygonsArr = data[6].match(/\d+/).map(function (v) {
              return parseInt(v);
            });
            var nrPolygons = nrPolygonsArr[0];
            //console.log(nrVertices);
            //console.log(nrPolygons);


            // what initial values
            var coords = data[9].split(" ");
            var x = parseFloat(coords[0]);
            var y = parseFloat(coords[1]);
            var z = parseFloat(coords[2]);
            vertices.push(vec4( x, y, z, 1.0 ));
            tp = x;
            bottom = x;
            r = y;
            l = y;
            far = z;
            near = z;

            var i = 0;
            for (i =10; i < nrVertices + 9; i++) {
              var coords = data[i].split(" ");
              var x = parseFloat(coords[0]);
              var y = parseFloat(coords[1]);
              var z = parseFloat(coords[2]);
              vertices.push(vec4( x, y, z, 1.0 ));

              //now we we check for the max x, y and z in order to plug these values in the perspective function
              //these are model coordinates, we have to pass them to eye coordinates
              r = Math.max(x,r);
              l = Math.min(x, l);

              tp = Math.max(y,tp);
              bottom = Math.min(y, bottom);

              far = Math.min(z,far);
              near = Math.max(z, near);


              //colors.push(vec4(1.0, 0.0, 0.0, 1.0));
              //console.log(coords[0] + " " + coords[1] + " " + coords[2]);
            }
            //console.log(r + " ")

            //console.log("---------------------------------");
            const j = i;
            for (i = j; i < nrPolygons + j; i++) {
              var pols = data[i].split(" ");
              //polygons.push(vec3( parseFloat(pols[0]), parseFloat(pols[1]),  parseFloat(pols[2])));
              poly(parseFloat(pols[1]), parseFloat(pols[2]),  parseFloat(pols[3]));
              //console.log(pols[1] + " " + pols[2] + " " + pols[3]);
            }

          	//Necessary for animation
          	render();


          }

      }
      reader.readAsText(file);
      //render();

    });
  }

	/**********************************
	* Points, Lines, and Fill
	**********************************/

	/*** VERTEX DATA ***/
	//Define the positions of our points
	//Note how points are in a range from 0 to 1
  /*
	points = [];
	colors = [];

	quad( 1, 0, 3, 2 );
	quad( 2, 3, 7, 6 );
	quad( 3, 0, 4, 7 );
	quad( 6, 5, 1, 2 );
	quad( 4, 5, 6, 7 );
	quad( 5, 4, 0, 1 ); */


  //this is the code that handles thevent when a key is pressed
  window.onkeypress = function(event) {
      var key = event.key;
      switch(key) {
          case 'd':
              tx -= 0.02;
              break;
          case 'a':
              tx += 0.02; //same
              break;
          case 'w':
              ty -= 0.02;
              break;
          case 's':
              ty += 0.02; //same
              break;
          case '+':
              tz -= 0.02;
              break;
          case '-':
              tz += 0.02;
              break;
          case 'p':
              pulse();
              break;
      }
      console.log("thomas");
      //render();
  }


  readFile();
  render();
}

var id;
 function render() {
   gl.enable(gl.DEPTH_TEST);

   // Clear the canvas AND the depth buffer.
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   var vBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

   var vPosition = gl.getAttribLocation(program, "vPosition");
   gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vPosition);

   var offsetLoc = gl.getUniformLocation(program, "vPointSize");
   gl.uniform1f(offsetLoc, 10.0);

   var cBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

   var vColor = gl.getAttribLocation(program, "vColor");
   gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vColor);
   console.log("thomas2");
  //console.log(points.length);
  for (var i = 0; i < (points.length)/3; i++) {

    //console.log("----" + i);
    //console.log(points[i].length);
    //console.log(colors.length);
    //var triang = points.slice(i*3, i*3 + 3);
    //console.log(triang);

    //Create the buffer object


    //This is how we handle extents
    //We need to change this to see things once we've added perspective
    //var thisProj = ortho(-5, 5, -5, 5, -5, 100);

    var xDist = Math.abs(r-l);
    var yDist = Math.abs(tp-bottom);
    var zDist = Math.abs(near-far);
    var eyeDist = Math.max(xDist, yDist, zDist);

    //Math.atan((Math.max(xDist, yDist)/2)/eyeDist);
    var  fovy = 30; // ymax/zmin // height of the bounding box div by 2 then also only distance from eye to the near plane
    //fovy = ((fovy*180)/Math.PI)*2;

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var thisProj = perspective(fovy, aspect, 0.1, 10000);

    var projMatrix = gl.getUniformLocation(program, 'projMatrix');
    gl.uniformMatrix4fv(projMatrix, false, flatten(thisProj));
    // for proj perspective(fovy, 1, 0, zDist)

    // Set clear color
    //gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //gl.enable(gl.DEPTH_TEST);

  	var rotMatrix = rotate(0, vec3(-1, -1, 0));
  	//var rotMatrix = rotateY(theta);
  	//var rotMatrix2 = rotateX(45);
  	var translateMatrix = translate(tx, ty, tz);
  	//var tempMatrix = mult(rotMatrix, rotMatrix2);
  	//var ctMatrix = mult(translateMatrix, tempMatrix);
  	var ctMatrix = mult(translateMatrix, rotMatrix);

  	//theta += 0.05;
  	//alpha += 0.005;

    // 1. get extents, min max xyz
    // 2. based on extents where do we put the eye and where does the eye look : view ctMatrix
    // 3. based on extents what is fovy : proj matrix

    var at = vec3((r+l)/2, (tp+bottom)/2, 0); // should be out from the viewing frustum (near+far)/2
  	var eye = vec3(at[0], at[1], Math.max(r-l, tp-bottom)*2.5 + near); //eyeDist + near*2
  	var up = vec3(0.0, 1.0, 0.0);
  	var viewMatrix = lookAt(eye, at, up);

  	var ctMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
  	gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));

  	var viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
  	gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    //gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  	//gl.drawArrays(gl.POINTS, 0, points.length);
  	gl.drawArrays(gl.LINE_LOOP, i*3, 3);

  	//console.log(theta);

  	//if(theta < -90) {
  	//	cancelAnimationFrame(id);
  	//}
  	//else
  	//{
  		id = requestAnimationFrame(render);
  	//}
  }

}

//creates the normal vector of the triangle formed by the vertices a, b and c and adds it to the normals array
function newellMethod(a, b, c) {
  var nx = (a[1] - b[1])*(a[2] - b[2]) + (b[1] - c[1])*(b[2] - c[2]) + (c[1] - a[1])*(c[2] - a[2]);
  var ny = (a[2] - b[2])*(a[0] + b[0]) + (b[2] - c[2])*(b[0] + c[0]) + (c[2] - a[2])*(c[0] + a[0]);
  var nz = (a[0] - b[0])*(a[1] + b[1]) + (b[0] - c[0])*(b[1] + c[1]) + (c[0] - a[0])*(c[1] + a[1]);;

  normals.push(nx, ny, nz);
}

// I think that this function should modify the points array
function pulse() {
  //for each triangle
  for (var i = 0; i < (points.length)/3; i++) { //(points.length)/3 is the number of triangles. At the ith iteration we refer to the ith triangle.
    //var triang = points.slice(i*3, i*3 + 3);
    console.log("vertices before normal: ");
    console.log(points[i*3]);
    console.log(points[i*3 + 1]);
    console.log(points[i*3 + 2]);
    var n = normals[i];
    for (var j = 0; j < 3; j++) { // for each vertex we sum the component of the normal
      points[i*3 + j][0] += 0.1*n[0];
      points[i*3 + j][1] += 0.1*n[1];
      points[i*3 + j][2] += 0.1*n[2];
      /*
      for (var k = 0; k < 3; k++) { // for each coordinate
        //we take each coordinate of each point of the triangle and we sum to it the correspondent coordinate of the normal vector of that triangle.
        points[i*3 + j][k] = points[i*3 + j][k] + 0.5*n[k]; // TODO: THE n does not exist!
      } */
    }
    console.log("vertices after normal: ");
    console.log(points[i*3]);
    console.log(points[i*3 + 1]);
    console.log(points[i*3 + 2]);
    console.log("--------------");
    //now we add the normal vector to the
  }

}

function poly(a, b, c)
{
    points.push(vertices[a], vertices[b], vertices[c]);
    colors.push(vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0));
    newellMethod(vertices[a], vertices[b], vertices[c]);

}
