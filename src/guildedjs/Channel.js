import fetch from 'node-fetch';

import Message from './Message';
import sessionData, { USER_AGENT } from './session';

const API_URL = 'https://api.guilded.gg/channels'
const REFERER = 'https://www.guilded.gg';

class TextChannel {
  constructor(guild, data) {
    const {
      id,
    } = data;
    this.id = id;
    this.guild = guild;
    this.chanURL = `${API_URL}/${id}`
  }

  async send(data) {
    const msg = new Message(data, this);
    const body = {
      confirmed: false,
      messageId: msg.id,
      content: msg.content,
    }
    const response = await fetch(`${this.chanURL}/messages`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/json',
        'Origin': REFERER,
        'Referer': REFERER,
        'User-Agent': USER_AGENT,
        'Cookie': sessionData.cookies,
        'guilded-client-id': sessionData.clientId,
      },
      body: JSON.stringify(body),
    });
    if (response.status >= 300) {
      console.log('Error on sending message', await response.text());
    }
  }
}

export default TextChannel;
