import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import {
  ApiErrorCode,
  type ApiErrorResponse,
  type AuthenticatedUserDto,
  type HealthResponseDto,
} from "@albumsl/contracts";

import { authenticateUserFromAuthorizationHeader } from "./firebase-auth.js";
import { HttpApiError } from "./http-errors.js";

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

function sendApiError(
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  payload: ApiErrorResponse,
): void {
  sendJson(response, statusCode, payload);
}

function sendInternalError(response: ServerResponse<IncomingMessage>): void {
  sendApiError(response, 500, {
    error: {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: "Internal server error",
    },
  });
}

function sendNotFound(response: ServerResponse<IncomingMessage>): void {
  sendJson(response, 404, {
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
}

async function handleGetMe(request: IncomingMessage): Promise<AuthenticatedUserDto> {
  return authenticateUserFromAuthorizationHeader(request.headers.authorization);
}

export function createApiServer() {
  return createServer((request, response) => {
    void (async () => {
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

      if (method === "GET" && path === "/api/me") {
        try {
          const authenticatedUser = await handleGetMe(request);
          sendJson(response, 200, authenticatedUser);
          return;
        } catch (error) {
          if (error instanceof HttpApiError) {
            sendApiError(response, error.statusCode, {
              error: {
                code: error.code,
                message: error.message,
                details: error.details,
              },
            });
            return;
          }

          sendInternalError(response);
          return;
        }
      }

      sendNotFound(response);
    })().catch(() => {
      sendInternalError(response);
    });
  });
}
