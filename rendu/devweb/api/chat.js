import { proxyOllamaRequest } from "./_ollamaProxy.js";

export default function handler(request, response) {
  return proxyOllamaRequest(request, response, "/api/chat", ["POST"]);
}
