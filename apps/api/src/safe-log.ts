const DEFAULT_TIMEOUT_MS = 25_000;

export function createRequestLogContext(
  method: string,
  path: string,
): {
  readonly requestId: string;
  readonly method: string;
  readonly path: string;
  readonly startedAt: number;
} {
  return {
    requestId: crypto.randomUUID(),
    method,
    path,
    startedAt: Date.now(),
  };
}

export function logApiStage(
  context: ReturnType<typeof createRequestLogContext>,
  stage: string,
  extra: Record<string, string | number | boolean | undefined> = {},
): void {
  console.info(
    JSON.stringify({
      event: "api_stage",
      requestId: context.requestId,
      method: context.method,
      path: context.path,
      stage,
      durationMs: Date.now() - context.startedAt,
      ...extra,
    }),
  );
}

export async function withApiTimeout<T>(
  context: ReturnType<typeof createRequestLogContext>,
  stage: string,
  task: Promise<T>,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutTask = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      logApiStage(context, `${stage}_timeout`, { timeoutMs });
      reject(new Error(`${stage} timed out`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([task, timeoutTask]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
