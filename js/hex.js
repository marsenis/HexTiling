var canvWidth = 600, canvHeight = 600;
var hexR = canvWidth / 2;           // Radius of hexagon in pixels
var hexPhi = Math.PI / 3; // Inner angle of hexagon in radians
var n = 4;
var v, dx, dl, dr;
var epsilon = 5;

var blocks = [ [4, 3, 3, 0],
               [3, 2, 1, 0],
               [2, 1, 1, 0],
               [1, 1, 1, 0] ];
var paths;

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

function init() {
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
  blocks.push(new Array(n).fill(0));

  console.log(n);

  // Set canvas size
  var canvas = document.getElementById('canv');
  canvas.width = canvWidth; canvas.height = canvHeight;

  // Blank canvas
  var path = new Path();
  path.add(new Point(0, 0));
  path.add(new Point(0, canvHeight));
  path.add(new Point(canvWidth, canvHeight));
  path.add(new Point(canvWidth, 0));
  path.add(new Point(0, 0));
  path.fillColor = 'white';

  // vs: verticed of hexagon in clockwise order
  v = [ new Point(  hexR*Math.cos(hexPhi), hexR*Math.sin(hexPhi) ) ];
  for (var i = 0; i < 5; i++) {
    v.push( rotate(v[i], hexPhi) );
  }

  // Unit vectors on useful directions
  dx = (v[0] - v[5]) / n;
  dl = (v[4] - v[5]) / n;
  dr = (v[1] - v[0]) / n;

  drawHex();
  //drawSourceSinkPath(1, [1, 0, 1, 0, 1, 0]);
  //drawSourceSinkPath(2, [1, 1, 1, 0, 0, 0]);
  //drawSourceSinkPath(3, [1, 1, 1, 0, 0, 0]);

  //drawSourceSinkPath(1, [0, 1, 0, 1, 0, 1]);
  //drawSourceSinkPath(2, [1, 0, 1, 0, 1, 0]);
  //drawSourceSinkPath(3, [1, 0, 1, 1, 0, 0]);

  /*
  tilled = new Array(2*n-1);
  for (var i = 0; i < 2*n; i++)
    tilled[i] = new Array(n+i+1).fill(false);
  */
  
  fillBlanks();

  paths = blocksToPaths(blocks);

  for (var i = 0; i < n; i++)
    drawSourceSinkPath(i+1, paths[i]);

  //drawSourceSinkPath(1, [0, 1, 0, 1, 0, 1, 0, 1]);
  //drawSourceSinkPath(2, [1, 0, 1, 0, 1, 0, 0, 1]);
  //drawSourceSinkPath(3, [1, 0, 1, 1, 0, 0, 0, 1]);
  //drawSourceSinkPath(4, [1, 1, 1, 1, 0, 0, 0, 0]);

  console.log(blocksToPaths(blocks));
}

function fillBlanks() {
  console.log("hi");
  for (var r = 0; r < n; r++)
    for (var c = 0; c < n + r + 1; c++) {
      var p = v[5] + dx*c + dl*r;
      drawRect(p, p + dl, p + dl + dr, p + dr, '#FFB000');
    }
  for (var r = n; r < 2*n - 1; r++)
    for (var c = r - n + 1; c < 2*n; c++) {
      var p = v[5] + dx*c + dl*r;
      drawRect(p, p + dl, p + dl + dr, p + dr, '#FFB000');
    }
}

function rotate(p, phi) {
  return new Point( p.x*Math.cos(phi) + p.y*Math.sin(phi), - p.x*Math.sin(phi) + p.y*Math.cos(phi) );
}

function fixPoint(p) {
  return new Point( p.x + canvWidth /2, -p.y + canvHeight / 2 );
}

function drawLine(p, t, col, width) {
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

function drawRect(a, b, c, d, col) {
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

  //drawLine(p, p + dx);
  //drawLine(p, p + dl);
  //drawLine(p, p + dr);

  for (var i = 0; i < path.length; i++) {
    var t = p + (path[i] ? dr : dl);
    var col = (path[i] ? '#648FFF' : '#CD267F');

    drawRect(p, t, t + dx, p + dx, col);
    drawLine(p, t, 'black', epsilon);

    /*
    if (path[i])
      tilled[r][++c] = true;
    else
      tilled[r][c] = true;
    */

    p = t;
    r++;
  }
}

function drawHex() {
  bgColor = 'orange';
  fgColor = 'black';

  // Update n value
  //var k = parseInt(document.getElementById("nValue").value);
  //if (!isNaN(k)) n = k

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

globals.init = init
//window.onload = init;
init();
