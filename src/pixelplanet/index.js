import fetch from 'node-fetch';

import renderCanvas from './renderCanvas';
import Palette from './Palette';
import {
  TILE_SIZE,
  TILE_ZOOM_LEVEL,
} from './constants';

const linkRegExp = /(#[a-z]*,-?[0-9]*,-?[0-9]*(,-?[0-9]+)?)/gi;
const linkRegExpFilter = (val, ind) => ((ind % 3) !== 2);

let canvases = null;

async function fetchCanvasData() {
  try {
    const response = await fetch('https://pixelplanet.fun/api/me');
    if (response.status >= 300) {
      throw new Error('Can not connect to pixelplanet!');
    }
    const data = await response.json();
    const canvasMap = new Map();

    const ids = Object.keys(data.canvases);
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      const canvas = data.canvases[id];
      canvas.id = id;
      canvas.palette = new Palette(canvas.colors);
      canvas.maxTiledZoom = Math.log2(canvas.size / TILE_SIZE) / TILE_ZOOM_LEVEL * 2;
      canvasMap.set(canvas.ident, canvas);
    }
    canvases = canvasMap;
    console.log('Successfully fetched canvas data from pixelplanet');
  } catch (e) {
    console.log('Couldn\'t connect to pixelplanet, trying to connect again in 60s');
    setTimeout(fetchCanvasData, 60000);
    throw(e)
  }
}
fetchCanvasData();

export async function parseCanvasLinks(msg) {
  const {
    text,
  } = msg;

  if (!text || !canvases) {
    return;
  }

  const msgArray = text.split(linkRegExp).filter(linkRegExpFilter);
  if (msgArray.length > 1) {
    const coordsParts = msgArray[1].substr(1).split(',');
    const [ canvasIdent, x, y, z ]  = coordsParts;

    const canvas = canvases.get(canvasIdent);
    if (!canvas) {
      return;
    }
    console.log(`Fetch canvas ${canvas.title} on ${x}/${y} with zoom ${z}`);

    const image = await renderCanvas(canvas, x, y, z);
    msg.reply({
      attachments: [
        {
          image,
          text: `${canvas.title} on ${x}/${y} with zoom ${z}`,
        }
      ],
    });
  }
}
