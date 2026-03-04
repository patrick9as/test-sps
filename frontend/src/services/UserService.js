import api from "./api";

class UserService {
  async list() {
    const response = await api.get("/users");
    return response;
  }
  async get(id) {
    const response = await api.get(`/users/${id}`);
    return response;
  }
  async create(data) {
    const response = await api.post("/users", data);
    return response;
  }
  async delete(id) {
    const response = await api.delete(`/users/${id}`);
    return response;
  }
  async update(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response;
  }
}

export default new UserService();
