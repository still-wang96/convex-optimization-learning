const canvas = document.querySelector("#support-canvas");
const context = canvas.getContext("2d");
const slider = document.querySelector("#line-count");
const sliderValue = document.querySelector("#line-count-value");
const playButton = document.querySelector("#play-button");

const state = {
  count: Number(slider.value),
  playing: false,
  frame: 0,
};

const plot = {
  left: 70,
  right: 940,
  top: 55,
  bottom: 540,
  xMin: -3,
  xMax: 3,
  yMin: -1,
  yMax: 10,
};

slider.addEventListener("input", () => {
  state.count = Number(slider.value);
  sliderValue.textContent = String(state.count);
  draw();
});

playButton.addEventListener("click", () => {
  state.playing = !state.playing;
  playButton.textContent = state.playing ? "Pause" : "Play";
  if (state.playing) {
    requestAnimationFrame(tick);
  }
});

draw();

function tick() {
  if (!state.playing) {
    return;
  }

  state.frame += 1;
  if (state.frame % 7 === 0) {
    state.count = state.count >= Number(slider.max) ? 1 : state.count + 1;
    slider.value = String(state.count);
    sliderValue.textContent = String(state.count);
    draw();
  }
  requestAnimationFrame(tick);
}

function f(x) {
  return x * x;
}

function tangent(a, x) {
  return 2 * a * x - a * a;
}

function toX(x) {
  return plot.left + ((x - plot.xMin) / (plot.xMax - plot.xMin)) * (plot.right - plot.left);
}

function toY(y) {
  return plot.bottom - ((y - plot.yMin) / (plot.yMax - plot.yMin)) * (plot.bottom - plot.top);
}

function supports(count) {
  if (count === 1) {
    return [0];
  }

  const values = [];
  for (let i = 0; i < count; i += 1) {
    values.push(plot.xMin + (i / (count - 1)) * (plot.xMax - plot.xMin));
  }
  return values;
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawTangents();
  drawEnvelope();
  drawFunction();
  drawLabels();
}

function drawBackground() {
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "#e8edf4";
  context.lineWidth = 1;

  for (let x = -3; x <= 3; x += 1) {
    line(toX(x), plot.top, toX(x), plot.bottom);
  }

  for (let y = 0; y <= 10; y += 2) {
    line(plot.left, toY(y), plot.right, toY(y));
  }

  context.strokeStyle = "#222";
  context.lineWidth = 2;
  line(plot.left, toY(0), plot.right, toY(0));
  line(toX(0), plot.top, toX(0), plot.bottom);
}

function drawFunction() {
  context.strokeStyle = "#1358b8";
  context.lineWidth = 4;
  context.beginPath();
  for (let i = 0; i <= 420; i += 1) {
    const x = plot.xMin + (i / 420) * (plot.xMax - plot.xMin);
    const y = f(x);
    const px = toX(x);
    const py = toY(y);
    if (i === 0) {
      context.moveTo(px, py);
    } else {
      context.lineTo(px, py);
    }
  }
  context.stroke();
}

function drawTangents() {
  const values = supports(state.count);
  context.strokeStyle = "rgba(182, 92, 22, 0.38)";
  context.lineWidth = 1.6;

  values.forEach((a) => {
    const y1 = tangent(a, plot.xMin);
    const y2 = tangent(a, plot.xMax);
    line(toX(plot.xMin), toY(y1), toX(plot.xMax), toY(y2));
  });

  context.fillStyle = "#b65c16";
  values.forEach((a) => {
    dot(toX(a), toY(f(a)), 3);
  });
}

function drawEnvelope() {
  const values = supports(state.count);
  context.strokeStyle = "#218a4a";
  context.lineWidth = 3;
  context.beginPath();

  for (let i = 0; i <= 420; i += 1) {
    const x = plot.xMin + (i / 420) * (plot.xMax - plot.xMin);
    const y = Math.max(...values.map((a) => tangent(a, x)));
    const px = toX(x);
    const py = toY(y);
    if (i === 0) {
      context.moveTo(px, py);
    } else {
      context.lineTo(px, py);
    }
  }

  context.stroke();
}

function drawLabels() {
  context.font = "20px Georgia, serif";
  context.fillStyle = "#1358b8";
  context.fillText("f(x)=x²", toX(2.05), toY(4.8));

  context.fillStyle = "#b65c16";
  context.fillText("affine supports", toX(-2.85), toY(9.25));

  context.fillStyle = "#218a4a";
  context.fillText("max of supports", toX(1.05), toY(1.9));

  context.fillStyle = "#333";
  context.font = "17px Georgia, serif";
  context.fillText(`supporting lines: ${state.count}`, plot.left, 30);
}

function line(x1, y1, x2, y2) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function dot(x, y, radius) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}
