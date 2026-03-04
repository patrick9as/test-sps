import api from "./api";

class UserService {
  async list() {
    const response = await api.get("/users");
    return response;
  }
  async get(id) {
    throw new Error("Not implemented");
  }
  async create(data) {
    throw new Error("Not implemented");
  }
  async delete(id) {
    const response = await api.delete(`/users/${id}`);
    return response;
  }
  async update(id, data) {
    throw new Error("Not implemented");
  }
}

export default new UserService();
