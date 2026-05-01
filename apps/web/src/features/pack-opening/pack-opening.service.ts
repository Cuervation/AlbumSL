import type {
  ClaimDailyPackRequestDto,
  ClaimDailyPackResponseDto,
  OpenPackRequestDto,
  OpenPackResponseDto,
} from "@albumsl/contracts";
import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "../../lib/firebase";

const claimDailyPackCallable = httpsCallable<ClaimDailyPackRequestDto, ClaimDailyPackResponseDto>(
  firebaseFunctions,
  "claimDailyPack",
);

const openPackCallable = httpsCallable<OpenPackRequestDto, OpenPackResponseDto>(
  firebaseFunctions,
  "openPack",
);

export async function claimDailyPack(
  request: ClaimDailyPackRequestDto = {},
): Promise<ClaimDailyPackResponseDto> {
  const response = await claimDailyPackCallable(request);
  return response.data;
}

export async function openPack(request: OpenPackRequestDto): Promise<OpenPackResponseDto> {
  const response = await openPackCallable(request);
  return response.data;
}
