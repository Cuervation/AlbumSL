import type { AdminDashboardRequestDto, AdminDashboardResponseDto } from "@albumsl/contracts";
import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "../../lib/firebase";

const adminGetDashboardCallable = httpsCallable<
  AdminDashboardRequestDto,
  AdminDashboardResponseDto
>(firebaseFunctions, "adminGetDashboard");

export async function getAdminDashboard(): Promise<AdminDashboardResponseDto> {
  const response = await adminGetDashboardCallable({});
  return response.data;
}
