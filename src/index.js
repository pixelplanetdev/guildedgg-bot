import Guilded from './guildedjs';

import { drawText } from './commands/draw';
import { parseCanvasLinks } from './pixelplanet';

const email = process.argv[2];
const password = process.argv[3];

const guilded = new Guilded(email, password);

const PREFIX = '$';

guilded.on('message', (msg) => {
  const {
    text,
    attachments,
  } = msg;
  if (text.indexOf(PREFIX) == 0) {
    const argv = text.substr(1).split(' ').filter((el) => el);
    const command = argv[0];

    switch (command) {
      case 'help': {
          msg.channel.send('Currently availably commands:\n$ping\n$help\n$draw');
        }
        break;
      case 'ping': {
          console.log("sending pong back");
          msg.channel.send({
            text: 'pong',
            attachments: [
              // upload local file
              './image.png',
              // use already previously uploaded file (can just use aws urls)
              'https://s3-us-west-2.amazonaws.com/www.guilded.gg/ContentMedia/2a1c7833626ec949f32b42f51a3b8334-Full.webp?w=960&h=768',
            ],
          });
        }
        break;
      case 'draw': {
          if (argv.length > 1) {
            const text = argv.slice(1).join(' ');
            //drawText()
            console.log(`drawing ${text}`);
            msg.channel.send({
              attachments: [
                {
                  // upload image with buffer
                  image: drawText(text),
                  text: 'got cha',
                }
              ],
            });
          }
        }
        break;
      default:
        //nothing
    }
  }

  // react on all messages of specific user with emoji
  // emojiId gt taken from browser dev tools
  /*
  if (msg.user.id === 'GmjQ1Vgd') {
    msg.react(222919);
  }
  if (msg.user.id === '64vKYJBd') {
    msg.react(222920);
  }
  */

  // reply to pixelplanet.fun urls
  parseCanvasLinks(msg);
});
