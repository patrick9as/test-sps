import axios from "axios";

class UserService {
  async list() {
    const baseURL = import.meta.env.VITE_SERVER_URL || "";
    const users = await axios.get(`${baseURL}/users`);
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
