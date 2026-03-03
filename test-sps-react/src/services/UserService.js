import axios from "axios";

class UserService {
  async list() {
    const users = await axios.get(`${process.env.REACT_APP_SERVER_URL}/users`);
    return users;
  }
  async get(id) {
    throw new Error("Not implemented");
  }
  async create(data) {
    throw new Error("Not implemented");
  }
  async delete(id) {
    throw new Error("Not implemented");
  }
  async update(id, data) {
    throw new Error("Not implemented");
  }
}

export default UserService;
