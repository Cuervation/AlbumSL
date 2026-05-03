import { createApiServer } from "./server.js";

function getPort(): number {
  const rawPort = process.env.PORT;

  if (!rawPort) {
    return 8081;
  }

  const parsedPort = Number.parseInt(rawPort, 10);
  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return parsedPort;
}

const port = getPort();
const server = createApiServer();

server.listen(port, () => {
  console.log(`albumsl-api listening on http://localhost:${port}`);
});
