import fetch from 'node-fetch';

import {
  createCanvas,
  loadImage,
  createImageData,
} from 'canvas';

import {
  TILE_SIZE,
} from './constants';

export async function getChunk(
  canvas,
  zoom,
  cx,
  cy,
) {
  const tile = createCanvas(TILE_SIZE, TILE_SIZE);

  const canvasId = canvas.id;
  if (canvas.maxTiledZoom === zoom) {
    await fetchBaseChunk(canvasId, canvas.palette, zoom, cx, cy, tile);
  } else {
    await fetchTile(canvasId, zoom, cx, cy, tile);
  }
  return tile;
}

async function fetchBaseChunk(
  canvasId,
  palette,
  zoom,
  cx, cy,
  tile,
) {
  const url = `https://pixelplanet.fun/chunks/${canvasId}/${cx}/${cy}.bmp`;
  console.log(`Fetching ${url}`);
  const response = await fetch(url);
  if (response.ok) {
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength) {
      const chunkArray = new Uint8Array(arrayBuffer);
      const abgr = palette.buffer2ABGR(chunkArray);
      const imageData = createImageData(
        new Uint8ClampedArray(abgr.buffer),
        TILE_SIZE,
        TILE_SIZE,
      );
      const ctx = tile.getContext('2d');
      ctx.putImageData(imageData, 0, 0);
    }
  }
}

async function fetchTile(canvasId, zoom, cx, cy, tile) {
  const url = `https://pixelplanet.fun/tiles/${canvasId}/${zoom}/${cx}/${cy}.png`;
  console.log(`Fetching ${url}`);
  const image = await loadImage(url);
  const ctx = tile.getContext('2d');
  ctx.drawImage(image, 0, 0);
}
