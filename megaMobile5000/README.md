# Mega Mobile 5000
###Camelia Daniela Brumar

![megam5000](https://i.imgur.com/xcMZBaD.png)

To run this application, just download the thingy as a .zip file, extract the files, and click/execute the html file!
### Increase/decrease the spotlight hit the key:
  'p' to increase
  'P' to decrease (yeah, it is case sensitive)

### To move the spotlight in the x and y directions, hit the key:
  'd' to move the spotlight in the positive X direction <br>
  'a' to move the spotlight in the negative X direction <br>
  'w' to move the spotlight in the positive Y direction <br>
  's' to move the spotlight in the negative Y direction <br>

### To change the speed of the mobile, please hit the key (it is nicer to keep the key pressed):
  'r' to increment the speed <br>
  'e' to decrement the speed

## To change the type of lightning on the cubes, hit (not me, the key):
  'm' for Gourand lightning <br>
  'M' for flat lightning

## Technical Details about the code
The code is structured in the following way:
- the main is the function
    window.onload = function init()
  Where we load the shaders, we create the points and the normals for our objects, and we set the actions to be performed when the keys are pressed.
  At the very end of this function we call render().
- In render we choose what set of normals we want to use for the cubes, depending on what shading we want, flat or Gourand.
  Afterwards we start the part with the hierarchy and the moving objects.
- The draw method is called from render and it is where we initialize the buffers and some of the uniform variables from the shaders.
- The methods smallHanger, bigHanger, cube, quad, newellMethod, triangle, divideTriangle and tetrahedron are used to create the hangers, cubes and the spheres.
