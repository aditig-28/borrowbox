import axios from "axios";

const API = axios.create({
  baseURL: "https://borrowbox-0kro.onrender.com/api",
});

export default API;