const icons = ['apple-alt', 'futbol', 'football-ball', 'crow', 'globe-asia', 'fighter-jet', 'surprise', 'grin-tongue-squint', 'space-shuttle', 'hourglass'];
const UIstartBtn = document.querySelector('.start-btn');
const UIgameOverEle = document.querySelector('#game-over-ele');
const UIscoreDash = document.querySelector('.scoreDash');
const UIprogressBar = document.querySelector('.progress-bar');
const UIcontainer = document.querySelector('#container');
const UIbox = document.querySelector('.box');
const UIbase = document.querySelector('.base');
const UIdashboard = document.querySelector('.dashboard');
const UIboxCenter = [UIbox.offsetLeft + (UIbox.offsetWidth/2),
                     UIbox.offsetTop + (UIbox.offsetHeight/2)];
let gamePlay = false;
let player;
let animateGame;


eventListenerFuncs();

function eventListenerFuncs() {
  UIstartBtn.addEventListener('click', startGameFun);
  UIcontainer.addEventListener('mousedown', mouseDownFun);
  UIcontainer.addEventListener('mousemove', movePositionFun);
}

function startGameFun() {
  gamePlay = true;
  UIgameOverEle.style.display = 'none';
  player = {
    score: 0,
    barWidth: 100,
    lives: 100
  };
  // setup the enemy
  setupEnemy(10);
  animateGame = requestAnimationFrame(playGame);
}
function playGame() {
  if (gamePlay) {
    // move shots
    moveShots();
    // update dashboard
    updateDash();
    // move enemy
    moveEnemy();
    animateGame = requestAnimationFrame(playGame);
  }
}

function setupEnemy(num) {
 for (let x=0; x<num; x++) {
   enemyMaker();
 }
}
function enemyMaker() {
  let randomStart = randomMe(4); // 0 --- 3
  let x, y, xmove, ymove;
  let dirSet = randomMe(5) + 2;   // 2 --- 5
  let dirPos = randomMe(7) - 3;  // -3 --- 3
  switch(randomStart) {
    case 0:
      x = 0;
      y = randomMe(600);
      xmove = dirSet;
      ymove = dirPos;
    break;
    case 1:
      x = 800;
      y = randomMe(600);
      xmove = dirSet * -1;
      ymove = dirPos;
      break;
    case 2:
      y = 0;
      x = randomMe(800);
      xmove = dirPos;
      ymove = dirSet;
      break;
    case 3:
      y = 600;
      x = randomMe(800);
      xmove = dirPos;
      ymove = dirSet * -1;
      break;
  }
  let enemyIcon = document.createElement('div');
  enemyIcon.points = randomMe(5) + 1;
  let myIcon = icons[randomMe(icons.length)];
  enemyIcon.innerHTML = `<i class="fas fa-${myIcon}"></i>`;
  enemyIcon.classList.add('enemy');
  enemyIcon.style.fontSize = `${randomMe(20) + 30}px`;
  enemyIcon.style.left = `${x}px`;
  enemyIcon.style.top = `${y}px`;
  enemyIcon.moverx = xmove;
  enemyIcon.movery = ymove;
  UIcontainer.appendChild(enemyIcon);
}
function randomMe(num) {
  return Math.floor(Math.random()*num);
}

function moveShots() {
  document.querySelectorAll('.fireme').forEach(shot => {
    if (shot.offsetLeft < 0 || shot.offsetLeft > 800 ||
          shot.offsetTop < 0 || shot.offsetTop > 600) {
            shot.parentNode.removeChild(shot);
    } else {
      shot.style.left = `${shot.offsetLeft + shot.x}px`;      
      shot.style.top = `${shot.offsetTop + shot.y}px`;
    }   
  });
}

function moveEnemy() {
  let hitter = false;
  let tempEnemy = document.querySelectorAll('.enemy');
  let tempShots = document.querySelectorAll('.fireme');
  tempEnemy.forEach( enemy => {
    if (enemy.offsetLeft < 0 || enemy.offsetLeft > 750
      || enemy.offsetTop < 0 || enemy.offsetTop > 550) {
        enemy.parentNode.removeChild(enemy);
        enemyMaker();
    } else {
      enemy.style.left = enemy.offsetLeft + enemy.moverx + 'px';
      enemy.style.top = enemy.offsetTop + enemy.movery + 'px';
      tempShots.forEach(shot => {
        if (isCollide(shot, enemy)) {
          player.score += enemy.points;
          enemy.parentNode.removeChild(enemy);
          shot.parentNode.removeChild(shot);
          enemyMaker();      
        }
      })
    }
    if (isCollide(enemy, UIbox)) {
      hitter = true;
      player.lives--;
      if (player.lives < 0) gameOver();
    }
  });
  if (hitter) {
    document.querySelector('#myAudio').play();
    UIbase.classList.add('update-base-color');
    hitter = false;
  }
  else {
    UIbase.classList.remove('update-base-color');
  }
 
}

function updateDash() {
  UIscoreDash.textContent = player.score;
  let tempPer = `${(player.lives / player.barWidth) * 100}%`;
  UIprogressBar.style.width = tempPer;
}

function isCollide(a, b) {
  var aRect = a.getBoundingClientRect();
  var bRect = b.getBoundingClientRect();
  return (
      (bRect.bottom > aRect.top) && (aRect.bottom > bRect.top) && 
      (bRect.right > aRect.left) && (aRect.right > bRect.left)
  );
}

function gameOver() {
  cancelAnimationFrame(animateGame);
  UIgameOverEle.style.display = 'block';
  document.querySelector('.message').textContent = `Game Over Your Score is ${player.score}`;
  gamePlay = false;
  document.querySelectorAll('.fireme').forEach(shot => shot.parentNode.removeChild(shot));
  document.querySelectorAll('.enemy').forEach(icon => icon.parentNode.removeChild(icon));
}

function mouseDownFun(e) {
  if (gamePlay) {
    let bullet = document.createElement('div');
    bullet.className = 'fireme';
    let mouseAngle = getDeg(e);
    let transformAngle = 90 - mouseAngle;
    bullet.x = 7 * Math.sin(degRad(transformAngle));
    bullet.y = -7 * Math.cos(degRad(transformAngle));
    bullet.style.left = `${UIboxCenter[0] - 5}px`;
    bullet.style.top = `${UIboxCenter[1] - 5}px`;
  
    UIcontainer.appendChild(bullet);
  }
}

function movePositionFun(e) {
  if (gamePlay) {
    let mouseAngle = getDeg(e);
    let transformAngle = 90 - mouseAngle;
    UIbox.style.transform = `rotate(${transformAngle}deg)`;
  }

}

function getDeg(e) {
  let angle = Math.atan2(-(e.clientY - UIboxCenter[1]), e.clientX - UIboxCenter[0]);
  return angle * (180 / Math.PI);
}

function degRad(deg) {
  return deg * (Math.PI / 180);
}