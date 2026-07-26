// api.js
// US-25: One shared axios instance for every API call.
//
// In dev, Vite serves the frontend on :5173 and Spring Boot runs separately
// on :8080, so requests need the full backend address. In production (Heroku)
// the SAME server serves both the React files and the API, so requests are
// just relative ("/api/...") — no address needed, and no CORS involved.
//
// Components import this as `axios`, so call sites look identical to before:
//   import axios from "./api";
//   axios.get("/api/vehicles", { headers: ... })

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV ? "http://localhost:8080" : "",
});

export default api;
