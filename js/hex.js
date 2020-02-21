var W = 600, H = 600;     // Dimensions of canvas
var R = W / 2;            // Radius of hexagon in pixels
var hexPhi = Math.PI / 3; // Inner angle of hexagon in radians
var epsilon = 5;          // Width of source-sink paths
var n = 4;

// Color palette friendly to certain types of colorblindness
var yellow = '#FFB000';
var blue = '#648FFF';
var red = '#CD267F';

var v;
var dx, dl, dr;

var blocks, paths;

function main() {
  var syntaxErrDiv = document.getElementById("errDiv");
  var alertDiv = document.getElementById("alertDiv");

  syntaxErrDiv.style.display = "none";
  alertDiv.style.display = "none";

  try {
    blocks = JSON.parse( document.getElementById("blocksMatrix").value );
  } catch (err) {
    syntaxErrDiv.style.display = "block";
    return;
  }

  if (!checkValidity(blocks)) {
    alertDiv.style.display = "block";
    return;
  }

  n = blocks.length;
 
  // Append a row of zeros. Needed  in blocksToPaths
  blocks.push(new Array(n).fill(0));

  // Set canvas size
  var canvas = document.getElementById('canv');
  canvas.width = W; canvas.height = H;

  // Blank canvas
  var path = new Path();

  path.add(new Point(0, 0));
  path.add(new Point(0, H));
  path.add(new Point(W, H));
  path.add(new Point(W, 0));
  path.add(new Point(0, 0));
  path.fillColor = 'white';

  // v: verticed of hexagon in clockwise order
  v = [ new Point(  R*Math.cos(hexPhi), R*Math.sin(hexPhi) ) ];
  for (var i = 0; i < 5; i++)
    v.push( rotate(v[i], hexPhi) );

  // Unit vectors in useful directions
  dx = (v[0] - v[5]) / n;
  dl = (v[4] - v[5]) / n;
  dr = (v[1] - v[0]) / n;

  drawHex();

  fillBlanks();

  paths = blocksToPaths(blocks);

  for (var i = 0; i < n; i++)
    drawSourceSinkPath(i+1, paths[i]);
}

/*
 * Input: valid (n+1) x n array of cube stacks
 *        (n+1)-th row is assumed to be all zeros.
 * Output: Array of n vertex-disjoint paths
 *         on the hexagonal grid
 */
function blocksToPaths(blocks) {
  var p = new Array(n);

  for (var j = 0; j < n; j++) {
    p[j] = new Array();
    var cur = n;
    for (var i = 0; i <= n && cur >= 0 && n - i + cur > 0; )
      if (cur == blocks[i][j]) {
        p[j].push(0);
        i++;
      } else {
        p[j].push(1);
        cur--;
      }
  }

  return p;
}

/*
 * Checks if input is a valid representation of stacks
 */
function checkValidity(blocks) {
  n = blocks.length;
  for (var i = 0; i < n; i++)
    if (blocks[i].length != n)
      return false;

  for (var i = 0; i < n; i++)
    for (var j = 1; j < n; j++)
      if (blocks[i][j-1] < blocks[i][j])
        return false;

  for (var j = 0; j < n; j++)
    for (var i = 1; i < n; i++)
      if (blocks[i-1][j] < blocks[i][j])
        return false;
  
  for (var i = 0; i < n; i++)
    for (var j = 0; j < n; j++)
      if (blocks[i][j] > n || blocks[i][j] < 0)
        return false;

  return true;
}

/*
 * Initially fills the grid with 'yellow'-type rhombuses
 */
function fillBlanks() {
  for (var r = 0; r < n; r++)
    for (var c = 0; c < n + r + 1; c++) {
      var p = v[5] + dx*c + dl*r;
      drawPoly(p, p + dl, p + dl + dr, p + dr, yellow);
    }
  for (var r = n; r < 2*n - 1; r++)
    for (var c = r - n + 1; c < 2*n; c++) {
      var p = v[5] + dx*c + dl*r;
      drawPoly(p, p + dl, p + dl + dr, p + dr, yellow);
    }
}

// Rotate vector p by phi radians clockwise
function rotate(p, phi) {
  return new Point( p.x*Math.cos(phi) + p.y*Math.sin(phi), - p.x*Math.sin(phi) + p.y*Math.cos(phi) );
}

// Translate coordinate system to match canvas convention
function fixPoint(p) {
  return new Point( p.x + W /2, -p.y + H / 2 );
}

/*
 * Draw a line from p to t of color col and width w
 * Due to limitations of paper.js, default parameter values
 * are given in the body of the function
 */
function drawLine(p, t, col, width) {
  // Default value assignment
  if (col == undefined) col = 'black';
  if (width == undefined) width = 1;

  var path = new Path();
  p = fixPoint(p);
  t = fixPoint(t);
  path.strokeColor = col;
  path.strokeWidth = width;
  path.moveTo(p);
  path.lineTo(t);
}

/*
 * Draw a polygon with vertices a, b, c, d and fill it with col
 */
function drawPoly(a, b, c, d, col) {
  drawLine(a, b);
  drawLine(b, c);
  drawLine(c, d);
  drawLine(d, a);

  var a = fixPoint(a);
  var b = fixPoint(b);
  var c = fixPoint(c);
  var d = fixPoint(d);

  var path = new Path;
  path.add(a);
  path.add(b);
  path.add(c);
  path.add(d);
  path.fillColor = col;
}

function drawSourceSinkPath(source, path) {
  // p: position our source (source is 1-indexed)
  var p = v[5] + dx*(source - 1);
  var r = 0, c = source - 1;

  for (var i = 0; i < path.length; i++) {
    var t = p + (path[i] ? dr : dl);
    var col = (path[i] ? blue : red);

    drawPoly(p, t, t + dx, p + dx, col);
    drawLine(p, t, 'black', epsilon);

    p = t;
    r++;
  }
}

function drawHex() {
  // First hexagon vertex
  var p = v[0];
  var dir = (v[5] - p) / n;

  for (var i = 0; i < 6; i++) {
    var t = rotate(p, hexPhi);
    var dir2 = (rotate(t, hexPhi) - t)/n;

    drawLine(p, t);

    var x1 = p + dir;
    var x2 = t + dir2;

    for (var j = 0; j < n; j++) {
      drawLine(x1, x2);
      x1 += dir;
      x2 += dir2;
    }

    dir = (p - t)/n;
    p = t;
  }
}

// Make main visible to global scope (outside of paper.js framework)
// and call it
globals.main = main;
main();
