/*
 * the most basic simplest guilded bot connector
 */

import EventEmitter from 'events';

import fetch from 'node-fetch';
import SocketIO from 'socket.io-client';
// for debuging with wireshark
// import sslkeylog from 'sslkeylog';
// sslkeylog.hookAll();

import TextChannel from './Channel';
import Message from './Message';
import Guild from './Guild';
import sessionData, { USER_AGENT } from './session';

const LOGIN_URL = 'https://api.guilded.gg/login';
const ME_URL = 'https://api.guilded.gg/me';
const API_URL = 'https://api.guilded.gg'
const REFERER = 'https://www.guilded.gg';


/*
 * Get cokkies from fetch respones
 * from:
 * https://stackoverflow.com/questions/34815845/how-to-send-cookies-with-node-fetch
 */
function parseCookies(response) {
  const raw = response.headers.raw()['set-cookie'];
  return raw.map((entry) => {
    const parts = entry.split(';');
    const cookiePart = parts[0];
    return cookiePart;
  }).join(';');
}


class Guilded extends EventEmitter {

  constructor(email, password, verbose=true) {
    super();
    this.verbose = verbose;
    this.connect(email, password);
    this.channels = new Map();
    this.guilds = [];
  }

  log(message) {
    this.verbose && console.log('Guildedjs', message);
  }

  async connect(email, password) {
    this.log(
      `Connecting to guilded with mail ${email}`,
    );
    try {
      if (!email || !password) {
        throw new Error(`Mail or password invalid`);
      }
      const body = JSON.stringify({
        email,
        password,
      });
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/json',
          'Origin': REFERER,
          'Referer': REFERER,
          'User-Agent': USER_AGENT,
          'guilded-client-id': sessionData.clientId,
        },
        body,
      });
      sessionData.cookies = parseCookies(response);
      this.log("Successfully loged in to guilded.gg");
      this.emit('loggedin', {});
      this.openSocket();
      this.loadMe();
    } catch (e) {
      const { message } = e;
      this.log(message);
      this.emit('onerror', message);
      throw(e);
    }
  }

  async openSocket() {
    this.log('Connecting to websocket with auth cookies.');
    if (!sessionData.cookies) {
      const err = new Error('Can\'t open socket. Not logged in.');
      this.log(err.message);
      this.emit('onerror', message);
    }

    const options = {
      transports: ['websocket'],
      path: '/socket.io',
      reconnection: true,
      extraHeaders: {
        'Origin': REFERER,
        'Referer': REFERER,
        'User-Agent': USER_AGENT,
        'Cookie': sessionData.cookies,
        'guilded-client-id': sessionData.clientId,
      },
    }
    const socket = new SocketIO(
      `${API_URL}`,
      options,
    );

    socket.on('connect', () => {
      console.log("connected to socket");
      this.emit('ready', {});
    });
    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        this.log('Server disconnected websocket');
      }
    });
    socket.on('connect_error', (e) => {
      const { message } = e;
      this.log(e);
      this.emit('onerror', message);
    });
    socket.on('error', (e) => {
      const { message } = e;
      this.log(e);
      this.emit('onerror', message);
    });

    socket.on('ChatMessageCreated', (msg) => {
      this.log("Received Chat message");
      const {
        channelId,
        teamId,
        message,
      } = msg;
      const guild = this.getGuild(teamId);
      const channel = this.getChannel(channelId, guild);
      this.emit('message', new Message(message, channel, guild));
    });

    this.socket = socket;
  }

  async loadMe() {
    this.log('Loading me');
    const response = await fetch(ME_URL, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Origin': REFERER,
        'Referer': REFERER,
        'User-Agent': USER_AGENT,
        'Cookie': sessionData.cookies,
        'guilded-client-id': sessionData.clientId,
      },
    });
    try {
      const data = await response.json();
      this.log(`Successfully fetched userdata of myself: ${data.user.name}`);
      const guilds = data.teams;
      for (let i = 0; i < guilds.length; i += 1) {
        const guild = guilds[i];
        this.log(`Fetching data for guild ${guild.name} ${guild.id}`);
        this.registerGuild(guild.id);
      }
    } catch (e) {
      const errmsg = `Error in me response: ${e.message}\n`;
      this.log(errmsg);
      this.emit('onerror', errmsg);
    }
  }

  registerGuild(guildId) {
    if (!this.guilds[guildId]) {
      this.guilds[guildId] = new Guild({ id: guildId });
    }
  }

  getGuild(guildId) {
    return this.guilds[guildId];
  }

  getChannel(channelId, guild) {
    let chan = this.channels.get(channelId);
    if (!chan) {
      chan = new TextChannel(
        guild,
        {
          id: channelId,
        }
      );
      this.channels.set(channelId, chan);
    }
    return chan;
  }
}

export default Guilded;
