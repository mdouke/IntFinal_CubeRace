let pose_results;

function setup() {
  let p5canvas = createCanvas(400, 400);
  p5canvas.parent('#canvas');

  gotPoses = function (results) {
    pose_results = results; 

    adjustCanvas();
  }
}

function draw() {
  clear();

  if (pose_results) {
    let landmark0 = pose_results.landmarks[0][0];
    let landmark15 = pose_results.landmarks[0][15];
    let landmark16 = pose_results.landmarks[0][16];
    fill(255, 0, 0);
    noStroke();
    circle(landmark0.x * width, landmark0.y * height, 5);
    circle(landmark15.x * width, landmark15.y * height, 5);
    circle(landmark16.x * width, landmark16.y * height, 5);

  }
}

function windowResized() {
  adjustCanvas();
}

function adjustCanvas() {
  var element_webcam = document.getElementById('webcam');
  resizeCanvas(element_webcam.clientWidth, element_webcam.clientHeight);
}