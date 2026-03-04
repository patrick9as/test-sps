import api from "./api";

const AuthService = {
  async login(credentials) {
    const { data } = await api.post("/login", {
      email: credentials.email,
      password: credentials.password,
    });
    return data;
  },
};

export default AuthService;
