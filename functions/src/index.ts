import { onRequest } from "firebase-functions/v2/https";

import { createApplicationContext } from "@albumsl/application";
import { createFirebaseInfrastructure } from "@albumsl/infra-firebase";

const infrastructure = createFirebaseInfrastructure();
const application = createApplicationContext({ infrastructure });

export const health = onRequest((_request, response) => {
  response.status(200).json({
    ok: true,
    service: application.serviceName,
  });
});
