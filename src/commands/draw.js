import { createCanvas } from 'canvas';

export function drawText(text) {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');

  ctx.font = '50px Verdana';
  ctx.rotate(Math.random() / 5 - 0.1);
  const gradient = ctx.createLinearGradient(0, 0, 400, 0);
  gradient.addColorStop(0,"#FF0066");
  gradient.addColorStop(0.5, "#FFCC00");
  gradient.addColorStop(1.0, "#3FFF00");
  ctx.fillStyle = gradient;
  ctx.fillText(text, 10, 175);

  return canvas.toBuffer('image/png');
}
