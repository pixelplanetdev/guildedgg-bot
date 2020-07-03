import Guilded from './guildedjs';

const email = process.argv[2];
const password = process.argv[3];

const guilded = new Guilded(email, password);

guilded.on('message', (msg) => {
  const {
    text,
    attachments,
  } = msg;
  console.log(text, attachments);
  if (text === 'ping') {
    console.log("sending pong back");
    msg.channel.send({
      text: 'pong',
      attachments: [
        'https://s3-us-west-2.amazonaws.com/www.guilded.gg/ContentMedia/2a1c7833626ec949f32b42f51a3b8334-Full.webp?w=960&h=768',
      ],
    });
  }
});
