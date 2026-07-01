const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";

function getOllamaBaseUrl() {
  return (
    process.env.OLLAMA_BASE_URL ??
    process.env.VITE_OLLAMA_BASE_URL ??
    DEFAULT_OLLAMA_BASE_URL
  ).replace(/\/+$/, "");
}

function firstHeaderValue(value, fallback) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function getRequestBody(request) {
  if (request.body === undefined || request.body === null) {
    return undefined;
  }

  if (typeof request.body === "string" || Buffer.isBuffer(request.body)) {
    return request.body;
  }

  return JSON.stringify(request.body);
}

export async function proxyOllamaRequest(request, response, path, allowedMethods) {
  const method = request.method ?? "GET";

  if (!allowedMethods.includes(method)) {
    response.setHeader("Allow", allowedMethods.join(", "));
    return response.status(405).json({ error: "Method not allowed" });
  }

  const targetUrl = `${getOllamaBaseUrl()}${path}`;
  const body = method === "GET" || method === "HEAD" ? undefined : getRequestBody(request);

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method,
      body,
      headers: {
        "content-type": firstHeaderValue(request.headers["content-type"], "application/json"),
        "ngrok-skip-browser-warning": "true",
      },
    });

    const responseBody = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get("content-type");

    if (contentType) {
      response.setHeader("Content-Type", contentType);
    }

    return response.status(upstreamResponse.status).send(responseBody);
  } catch (error) {
    return response.status(502).json({
      error: "Unable to reach Ollama",
      details: error instanceof Error ? error.message : "Unknown proxy error",
    });
  }
}
