import Guilded from './guildedjs';

const email = process.argv[2];
const password = process.argv[3];

const guilded = new Guilded(email, password);

guilded.on('message', (msg) => {
  const text = msg.text;
  console.log(text);
  if (text === 'ping') {
    console.log("sending pong back");
    msg.channel.send('pong');
  }
});
