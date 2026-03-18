import api from "./api";

class AttachmentService {
  async list(userId) {
    const response = await api.get(`/users/${userId}/attachments`);
    return response;
  }

  async create(userId, files) {
    const formData = new FormData();
    Array.from(files || []).forEach((file) => {
      formData.append("files", file);
    });
    const response = await api.post(`/users/${userId}/attachments`, formData);
    return response;
  }

  async update(userId, attachmentId, data) {
    const response = await api.put(`/users/${userId}/attachments/${attachmentId}`, data);
    return response;
  }

  async remove(userId, attachmentId) {
    const response = await api.delete(`/users/${userId}/attachments/${attachmentId}`);
    return response;
  }

  async download(userId, attachmentId) {
    const response = await api.get(
      `/users/${userId}/attachments/${attachmentId}/content`,
      { responseType: "blob" },
    );
    return response;
  }
}

export default new AttachmentService();
