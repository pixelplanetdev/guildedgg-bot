import fetch from 'node-fetch';

import sessionData, { USER_AGENT } from './session';
import users from './User';

const API_URL = 'https://api.guilded.gg/teams';
const REFERER = 'https://www.guilded.gg';

class Guild {
  constructor(data) {
    const {
      id,
    } = data;
    this.id = id;
    this.members = [];
    this.owner = null;
    this.name = null;
    this.memberCount = 1488;
    this.fetchData();
  }

  async fetchData() {
    const response = await fetch(`${API_URL}/${this.id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': REFERER,
        'Referer': REFERER,
        'User-Agent': USER_AGENT,
        'Cookie': sessionData.cookies,
        'guilded-client-id': sessionData.clientId,
      },
    });
    try {
      const js = await response.json();
      const data = js.team;
      this.name = data.name;
      const { members } =  data;
      for (let i = 0; i < members.length; i += 1) {
        const userdata = members[i];
        const user = users.setUser(userdata);
        this.members.push(user);
      }
      this.owner =  users.getUser(data.ownerId);
    } catch (e) {
      console.log(`Could not parse guild`, e.message);
      throw(e);
    }
  }
}

export default Guild;
