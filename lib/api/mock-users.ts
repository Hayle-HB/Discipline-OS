/**
 * @deprecated Import from @/lib/data/json-store instead.
 * Kept for backward compatibility with auth routes.
 */
export {
  createMockToken,
  parseMockToken,
  requestPasswordReset,
  jsonDataProvider,
} from "@/lib/data/json-store";

import { jsonDataProvider } from "@/lib/data/json-store";
import type { UserRecord } from "@/lib/data/types";

export type MockUser = UserRecord;

export const findMockUser = jsonDataProvider.findUser.bind(jsonDataProvider);
export const findMockUserByEmail =
  jsonDataProvider.findUserByEmail.bind(jsonDataProvider);
export const getMockUserById =
  jsonDataProvider.findUserById.bind(jsonDataProvider);
export const emailExists = jsonDataProvider.emailExists.bind(jsonDataProvider);
export const addMockUser = jsonDataProvider.createUser.bind(jsonDataProvider);
export const getMockUsers = () => jsonDataProvider.findUserById("1") ? [] : [];
