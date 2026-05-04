import type {
  ClaimDailyPackRequestDto,
  ClaimDailyPackResponseDto,
  OpenPackRequestDto,
  OpenPackResponseDto,
} from "@albumsl/contracts";
import { httpsCallable } from "firebase/functions";

import { postAuthenticatedJson } from "../../lib/albumsl-api";
import { firebaseFunctions } from "../../lib/firebase";

const openPackCallable = httpsCallable<OpenPackRequestDto, OpenPackResponseDto>(
  firebaseFunctions,
  "openPack",
);

export async function claimDailyPack(
  request: ClaimDailyPackRequestDto = {},
): Promise<ClaimDailyPackResponseDto> {
  return postAuthenticatedJson<ClaimDailyPackRequestDto, ClaimDailyPackResponseDto>(
    "/api/packs/claim-daily",
    request,
  );
}

export async function openPack(request: OpenPackRequestDto): Promise<OpenPackResponseDto> {
  const response = await openPackCallable(request);
  return response.data;
}
