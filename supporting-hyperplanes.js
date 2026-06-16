const canvas = document.querySelector("#hyperplane-canvas");
const ctx = canvas.getContext("2d");
const slider = document.querySelector("#angle-slider");
const angleValue = document.querySelector("#angle-value");
const animateButton = document.querySelector("#animate-button");

const state = {
  angle: Number(slider.value),
  playing: false,
};

const center = { x: 500, y: 320 };
const radiusX = 260;
const radiusY = 150;

slider.addEventListener("input", () => {
  state.angle = Number(slider.value);
  angleValue.textContent = `${state.angle}°`;
  draw();
});

animateButton.addEventListener("click", () => {
  state.playing = !state.playing;
  animateButton.textContent = state.playing ? "Pause" : "Play";
  if (state.playing) {
    requestAnimationFrame(tick);
  }
});

draw();

function tick() {
  if (!state.playing) {
    return;
  }

  state.angle = (state.angle + 0.7) % 360;
  slider.value = String(Math.round(state.angle));
  angleValue.textContent = `${Math.round(state.angle)}°`;
  draw();
  requestAnimationFrame(tick);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  const theta = (state.angle * Math.PI) / 180;
  const normal = { x: Math.cos(theta), y: -Math.sin(theta) };
  const support = supportPoint(normal);
  const tangent = { x: -normal.y, y: normal.x };

  shadeHalfspace(support, normal);
  drawEllipse();
  drawSupportingLine(support, tangent);
  drawNormal(support, normal);
  drawLabels(support, normal);
}

function supportPoint(normal) {
  const denom = Math.sqrt((radiusX * normal.x) ** 2 + (radiusY * normal.y) ** 2);
  return {
    x: center.x + (radiusX ** 2 * normal.x) / denom,
    y: center.y + (radiusY ** 2 * normal.y) / denom,
  };
}

function shadeHalfspace(point, normal) {
  const tangent = { x: -normal.y, y: normal.x };
  const far = 1200;
  const p1 = { x: point.x + tangent.x * far, y: point.y + tangent.y * far };
  const p2 = { x: point.x - tangent.x * far, y: point.y - tangent.y * far };
  const inward = { x: -normal.x * far, y: -normal.y * far };

  ctx.fillStyle = "rgba(182, 92, 22, 0.1)";
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p2.x + inward.x, p2.y + inward.y);
  ctx.lineTo(p1.x + inward.x, p1.y + inward.y);
  ctx.closePath();
  ctx.fill();
}

function drawEllipse() {
  ctx.fillStyle = "rgba(20, 89, 184, 0.16)";
  ctx.strokeStyle = "#1459b8";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawSupportingLine(point, tangent) {
  const far = 900;
  ctx.strokeStyle = "#b65c16";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(point.x - tangent.x * far, point.y - tangent.y * far);
  ctx.lineTo(point.x + tangent.x * far, point.y + tangent.y * far);
  ctx.stroke();

  ctx.fillStyle = "#b65c16";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawNormal(point, normal) {
  const end = {
    x: point.x + normal.x * 90,
    y: point.y + normal.y * 90,
  };

  ctx.strokeStyle = "#218a4a";
  ctx.fillStyle = "#218a4a";
  ctx.lineWidth = 3;
  arrow(point.x, point.y, end.x, end.y);
}

function drawGrid() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#e8edf4";
  ctx.lineWidth = 1;
  for (let x = 80; x < canvas.width; x += 80) {
    line(x, 40, x, canvas.height - 50);
  }
  for (let y = 80; y < canvas.height; y += 80) {
    line(50, y, canvas.width - 50, y);
  }
}

function drawLabels(point, normal) {
  ctx.font = "20px Georgia, serif";
  ctx.fillStyle = "#1459b8";
  ctx.fillText("convex set C", center.x - 58, center.y + 8);

  ctx.fillStyle = "#b65c16";
  ctx.fillText("supporting hyperplane", 70, 90);

  ctx.fillStyle = "#218a4a";
  ctx.fillText("normal vector a", point.x + normal.x * 100 + 8, point.y + normal.y * 100);

  ctx.fillStyle = "#555";
  ctx.font = "17px Georgia, serif";
  ctx.fillText("C stays entirely in one closed halfspace", 70, canvas.height - 38);
}

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function arrow(x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  line(x1, y1, x2, y2);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 14 * Math.cos(angle - Math.PI / 7), y2 - 14 * Math.sin(angle - Math.PI / 7));
  ctx.lineTo(x2 - 14 * Math.cos(angle + Math.PI / 7), y2 - 14 * Math.sin(angle + Math.PI / 7));
  ctx.closePath();
  ctx.fill();
}
