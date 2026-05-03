import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import type { HealthResponseDto } from "@albumsl/contracts";

function getRequestedPath(request: IncomingMessage): string {
  return new URL(request.url ?? "/", "http://localhost").pathname;
}

function sendJson(
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  payload: object,
): void {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body).toString(),
  });
  response.end(body);
}

function sendNotFound(response: ServerResponse<IncomingMessage>): void {
  sendJson(response, 404, {
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
}

export function createApiServer() {
  return createServer((request, response) => {
    const method = request.method ?? "GET";
    const path = getRequestedPath(request);

    if (method === "GET" && path === "/api/health") {
      const healthResponse: HealthResponseDto = {
        ok: true,
        service: "albumsl-api",
      };
      sendJson(response, 200, healthResponse);
      return;
    }

    sendNotFound(response);
  });
}
