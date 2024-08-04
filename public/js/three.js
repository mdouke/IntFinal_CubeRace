import * as THREE from "three";

//const socket = io();

var mode = 0;

const width = 960;
const height = 540;

const groundWidth = 2500;
const groundLength = 30000;

const playerZ = groundLength / 2 - 200;

const obstacleZ = groundLength / 2 - 3000;

const cameraPosY = 500;
const cameraPosZ = 1500;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#myCanvas')
});
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

// 障害物を配置
const geometry2 = new THREE.BoxGeometry(400, 400, 200);
const geometry3 = new THREE.BoxGeometry(800, 400, 200);
const geometry4 = new THREE.BoxGeometry(1200, 400, 200);
const geometry5 = new THREE.BoxGeometry(1000, 400, 200);

var obstacles = [];

const material2 = new THREE.MeshStandardMaterial({ color: 0xD00000 });
const obstacle = new THREE.Mesh(geometry2, material2);
obstacles.push(obstacle);
obstacle.position.set(0, 100, obstacleZ);

const obstacle2 = new THREE.Mesh(geometry2, material2);
obstacles.push(obstacle2);
obstacle2.position.set(400, 100, obstacleZ - 3000);

const obstacle3 = new THREE.Mesh(geometry3, material2);
obstacles.push(obstacle3);
obstacle3.position.set(-400, 100, obstacleZ - 3000);

const obstacle4 = new THREE.Mesh(geometry4, material2);
obstacles.push(obstacle4);
obstacle4.position.set(650, 100, obstacleZ - 6000);

const obstacle5 = new THREE.Mesh(geometry3, material2);
obstacles.push(obstacle5);
obstacle5.position.set(-550, 100, obstacleZ - 6000);

const obstacle6 = new THREE.Mesh(geometry4, material2);
obstacles.push(obstacle6);
obstacle6.position.set(-650, 100, obstacleZ - 9000);

const obstacle7 = new THREE.Mesh(geometry5, material2);
obstacles.push(obstacle7);
obstacle7.position.set(750, 100, obstacleZ - 9000);

const obstacle8 = new THREE.Mesh(geometry2, material2);
obstacles.push(obstacle8);
obstacle8.position.set(1050, 100, obstacleZ - 12000);

const obstacle9 = new THREE.Mesh(geometry4, material2);
obstacles.push(obstacle9);
obstacle9.position.set(50, 100, obstacleZ - 12000);

const obstacle10 = new THREE.Mesh(geometry2, material2);
obstacles.push(obstacle10);
obstacle10.position.set(-1050, 100, obstacleZ - 12000);

for (let i = 0; i < obstacles.length; i++) {
  scene.add(obstacles[i]);
}

// 相手の立方体を作成
const opponentGeometry = new THREE.BoxGeometry(200, 200, 200);
const opponentMaterial = new THREE.MeshStandardMaterial({color: 0xff6600});
const opponentMachine = new THREE.Mesh(opponentGeometry, opponentMaterial);
opponentMachine.position.set(0, 100, playerZ);
socket.on('opponent', (players) => {
    scene.add(opponentMachine);
});

// 立方体を作成
const myGeometry = new THREE.BoxGeometry(200, 200, 200);
const myMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
const myMachine = new THREE.Mesh(myGeometry, myMaterial);
myMachine.position.set(0, 100, playerZ);
socket.on('myMachine', (players) => {
    scene.add(myMachine);
});

// カメラを作成
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
camera.position.set(0, cameraPosY, playerZ + cameraPosZ);

// ライトを作成
const light = new THREE.DirectionalLight(0xFFFFFF);
light.intensity = 4;
light.position.set(1, 2, 1);
scene.add(light);

// 地面を作成
const groundGeometry = new THREE.PlaneGeometry(groundWidth, groundLength);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xA0A0A0 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

// 壁を作成
const wallGeometry = new THREE.PlaneGeometry(500, groundLength);
const wallMaterial1 = new THREE.MeshStandardMaterial({ color: 0xB0B0B0 });
const wallMaterial2 = new THREE.MeshStandardMaterial({ color: 0x909090 });
const wall1 = new THREE.Mesh(wallGeometry, wallMaterial1);
const wall2 = new THREE.Mesh(wallGeometry, wallMaterial2);
wall1.position.set(groundWidth / 2, 150, 0);
wall1.rotation.y = -Math.PI / 2;
wall1.rotation.x = -Math.PI / 2;
wall2.position.set(-groundWidth / 2, 150, 0);
wall2.rotation.y = Math.PI / 2;
wall2.rotation.x = -Math.PI / 2;
scene.add(wall1);
scene.add(wall2);

// スタートライン・ゴールラインを作成
const LineGeometry = new THREE.PlaneGeometry(groundWidth, 200);
const LineMaterial = new THREE.MeshStandardMaterial({ color: 0xE0E0E0 });
const startLine = new THREE.Mesh(LineGeometry, LineMaterial);
startLine.position.set(0, 1, playerZ - 200);
startLine.rotation.x = -Math.PI / 2;
scene.add(startLine);

const goalLine = new THREE.Mesh(LineGeometry, LineMaterial);
goalLine.position.set(0, 1, -3000);
goalLine.rotation.x = -Math.PI / 2;
scene.add(goalLine);

// キーボード操作
const keyState = {};

function onDocumentKeyDown(event) {
  keyState[event.key] = true;
}

function onDocumentKeyUp(event) {
  keyState[event.key] = false;
}

document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

// 衝突判定関数
function detectCollision(mesh1, mesh2) {
  const mesh1Box = new THREE.Box3().setFromObject(mesh1);
  const mesh2Box = new THREE.Box3().setFromObject(mesh2);
  return mesh1Box.intersectsBox(mesh2Box);
}

// 効果音の読み込み
const collisionSound = new Audio('sounds/collision.mp3');

function playCollisionSound() {
  collisionSound.currentTime = 0; // 再生位置をリセット
  collisionSound.play();
}

const gameStartSound = new Audio('sounds/gameStart.mp3');

function playGameStartSound() {
  gameStartSound.currentTime = 0; // 再生位置をリセット
  gameStartSound.play();
}

const winnerSound = new Audio('sounds/winner.mp3');

function playWinnerSound() {
  winnerSound.currentTime = 0; // 再生位置をリセット
  winnerSound.play();
}

const loserSound = new Audio('sounds/loser.mp3');

function playLoserSound() {
  loserSound.currentTime = 0; // 再生位置をリセット
  loserSound.play();
}

// アニメーション
function animate() {
  requestAnimationFrame(animate);

  if (keyState['w'] || keyState['W']) {
    myMachine.position.z -= 10;
  }
  if (keyState['s'] || keyState['S']) {
    myMachine.position.z += 10;
  }
  if (keyState['a'] || keyState['A']) {
    myMachine.position.x -= 10;
  }
  if (keyState['d'] || keyState['D']) {
    myMachine.position.x += 10;
  }

  // 衝突判定
  for (let i = 0; i < obstacles.length; i++) {
    if (detectCollision(myMachine, obstacles[i])) {
      myMachine.position.z += 1500;
      playCollisionSound(); // 衝突音を再生
    }
  }
  if (detectCollision(myMachine, wall1)) {
    myMachine.position.x -= 50;
    playCollisionSound(); // 衝突音を再生
  } else if (detectCollision(myMachine, wall2)) {
    myMachine.position.x += 50;
    playCollisionSound(); // 衝突音を再生
  }


  socket.on('start', (message) => {
    console.log(message);
    console.log('make a circle');
    mode = 1;
  });

  socket.on('gameStart', (message) => {
    console.log(message);
    mode = 3;
    playGameStartSound();
  });

  // 動きを処理
  if (pose_results) {
    let landmark0 = pose_results.landmarks[0][0];
    let landmark15 = pose_results.landmarks[0][15];
    let landmark16 = pose_results.landmarks[0][16];

    let is_up = landmark0.y > landmark15.y && landmark0.y > landmark16.y;
    let is_down = landmark0.y < landmark15.y && landmark0.y < landmark16.y;
    let distance = dist(landmark15.x * width, landmark15.y * height, landmark16.x * width, landmark16.y * height);
    let distanceX = dist(landmark15.x, 0, landmark16.x, 0);
    let is15_right = landmark0.x > landmark15.x;
    let is15_left = landmark0.x < landmark15.x;
    let is16_right = landmark0.x > landmark16.x;
    let is16_left = landmark0.x < landmark16.x;

    let closeDistance = width * 0.3;
    if (mode === 1 && is_up && distance < closeDistance) {
      console.log("Ready");
      socket.emit('ready');
      mode = 2;
    } else if (mode === 2 && !(is_up && distance < closeDistance)) {
      console.log("unReady");
      socket.emit('unReady');
      mode = 1;
    }
    if (mode === 3) {
      if (is_down && distance < closeDistance && is15_right && is16_right) {
        //console.log("Right");
        myMachine.position.x += 7;
      } else if (is_down && distance < closeDistance && is15_left && is16_left) {
        //console.log("Left");
        myMachine.position.x -= 7;
      }
      if (is_down && is15_left && is16_right && distanceX > 0.3) {
        //console.log("distanceX: ", distanceX);
        myMachine.position.z -= 10 * (distanceX * 4 - 1 );
        myMachine.scale.x = distanceX * 2;
      } else {
        myMachine.scale.x = 1;
      }
    }
    if (myMachine.position.z < -3000 && opponentMachine.position.z > -3000 && mode === 3) {
      console.log('You Win!');
      playWinnerSound();
      socket.emit('gameEnd');
      mode = 4;
    } else if (myMachine.position.z > -3000 && opponentMachine.position.z < -3000 && mode === 3) {
      console.log('You Lose!');
      playLoserSound();
      socket.emit('gameEnd');
      mode = 4;
    } 
  }

  // myMachineの位置を常にサーバーに送信
  socket.emit('position', myMachine.position);
  socket.emit('scale', myMachine.scale);

  // カメラをmyMachineに追従
  camera.position.set(myMachine.position.x, myMachine.position.y + 500, myMachine.position.z + 1500);
  
  // 相手の位置を受信
  socket.on('opponent', (players) => {
    opponentMachine.position.set(players.position.x, players.position.y, players.position.z);
  });
  socket.on('opponentScale', (players) => {
    opponentMachine.scale.set(players.scale.x, players.scale.y, players.scale.z);
  });

  renderer.render(scene, camera);
}

animate();