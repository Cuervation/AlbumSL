import type {
  ClaimDailyPackRequestDto,
  ClaimDailyPackResponseDto,
  OpenPackRequestDto,
  OpenPackResponseDto,
} from "@albumsl/contracts";

import { postAuthenticatedJson } from "../../lib/albumsl-api";

export async function claimDailyPack(
  request: ClaimDailyPackRequestDto = {},
): Promise<ClaimDailyPackResponseDto> {
  return postAuthenticatedJson<ClaimDailyPackRequestDto, ClaimDailyPackResponseDto>(
    "/api/packs/claim-daily",
    request,
  );
}

export async function openPack(request: OpenPackRequestDto): Promise<OpenPackResponseDto> {
  return postAuthenticatedJson<OpenPackRequestDto, OpenPackResponseDto>("/api/packs/open", request);
}
