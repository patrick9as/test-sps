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

  async uploadProfilePicture(id, file) {
    const formData = new FormData();
    formData.append("profilePicture", file);
    const response = await api.post(`/users/${id}/profile-picture`, formData);
    return response;
  }
}

export default new UserService();
