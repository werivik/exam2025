import { API_KEY } from "../src/constants.js";

export function headers(accessToken = "") {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("X-Noroff-API-Key", API_KEY);

  if (accessToken) {
    headers.append("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}