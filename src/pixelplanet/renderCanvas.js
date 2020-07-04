import { createCanvas } from 'canvas';

import { getChunk } from './loadChunk';

import {
  WIDTH,
  HEIGHT,
  MAX_SCALE,
  TILE_SIZE,
  TILE_ZOOM_LEVEL,
} from './constants';

function coordToChunk(z, canvasSize, tiledScale) {
  return Math.floor((z + canvasSize / 2) / TILE_SIZE * tiledScale);
}

function chunkToCoord(z, canvasSize, tiledScale) {
  return Math.round(z * TILE_SIZE / tiledScale - canvasSize / 2);
}

async function drawChunk(
  ctx, xOff, yOff,
  canvas, tiledZoom, xc, yc,
) {
  try {
    const chunk = await getChunk(canvas, tiledZoom, xc, yc);
    ctx.drawImage(chunk, xOff,yOff);
  } catch(e) {
    console.log(`Chunk ${xc} / ${yc} - ${tiledZoom} is empty`);
  }
}

export default async function renderCanvas(
  canvas,
  x,
  y,
  z,
) {
  const can = createCanvas(WIDTH, HEIGHT);
  const ctx = can.getContext('2d');
  const canvasSize = canvas.size;

  let scale = 2 ** (z / 10);
  scale = Math.max(scale, TILE_SIZE / canvas.size);
  scale = Math.min(scale, MAX_SCALE);

  let tiledScale = (scale > 0.5)
    ? 0
    : Math.round(Math.log2(scale) / 2);
  tiledScale = TILE_ZOOM_LEVEL ** tiledScale;
  const tiledZoom = canvas.maxTiledZoom + Math.log2(tiledScale) / 2;

  const relScale = scale / tiledScale;
  ctx.scale(relScale, relScale);
  ctx.fillStyle = canvas.palette.colors[0];
  ctx.imageSmoothingEnabled = false;
  ctx.patternQuality = "nearest";
  ctx.antialias = 'none';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const tlX = Math.floor(x - WIDTH / 2 / scale);
  const tlY = Math.floor(y - HEIGHT / 2 / scale);
  const brX = Math.floor(x - 1 + WIDTH / 2 / scale);
  const brY = Math.floor(y - 1 + HEIGHT / 2 / scale);

  const tlCX = coordToChunk(tlX, canvasSize, tiledScale);
  const tlCY = coordToChunk(tlY, canvasSize, tiledScale);
  const brCX = coordToChunk(brX, canvasSize, tiledScale);
  const brCY = coordToChunk(brY, canvasSize, tiledScale);

  console.log(`Load chunks from ${tlCX} / ${tlCY} to ${brCX} / ${brCY}`);
  const chunkMax = canvasSize / TILE_SIZE * tiledScale;

  const promises = [];
  for (let xc = tlCX; xc <= brCX; xc += 1) {
    for (let yc = tlCY; yc <= brCY; yc += 1) {
      const xOff = Math.round((chunkToCoord(xc, canvasSize, tiledScale) - tlX) * tiledScale);
      const yOff = Math.round((chunkToCoord(yc, canvasSize, tiledScale) - tlY) * tiledScale);

      if (xc < 0 || xc >= chunkMax || yc < 0 || yc >= chunkMax) {
        ctx.clearRect(xOff, yOff, TILE_SIZE, TILE_SIZE);
        continue;
      }

      promises.push(
        drawChunk(ctx, xOff, yOff, canvas, tiledZoom, xc, yc),
      );
    }
  }
  await Promise.all(promises);

  return can.toBuffer('image/png');
}
