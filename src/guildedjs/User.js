class Users {
  constructor() {
    this.users = new Map();
  }

  setUser(data) {
    const {
      id,
    } = data;
    if (this.users.has(id)) {
      return;
    }
    console.log(`Got user ${data.name} - ${id}`);
    this.users.set(id, data);
    return data;
  }

  getUser(id) {
    let user = this.users.get(id);
    if (!user) {
      user = {
        id,
        name: id,
      };
    }
    return user;
  }
}

const users = new Users();

export default users;
