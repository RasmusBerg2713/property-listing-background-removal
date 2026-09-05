import { z } from "zod";
import { removeBackground } from "./infrai_client.js";

export const listingRequest = z.object({
  listingId: z.string().min(1),
  image: z.string().min(1),
  format: z.enum(["png", "webp"]).default("png"),
  inspectionDue: z.coerce.date().optional(),
  maintenanceRequest: z.object({ subject: z.string().min(1), priority: z.enum(["low", "normal", "urgent"]) }).optional(),
  tenantDocument: z.object({ name: z.string().min(1), kind: z.enum(["lease", "identity", "other"]) }).optional()
});
export type ListingRequest = z.infer<typeof listingRequest>;

export async function prepareListing(input: unknown) {
  const request = listingRequest.parse(input);
  const processed = await removeBackground(request.image, request.format);
  const reminder = request.inspectionDue && request.inspectionDue <= new Date() ? "inspection_due" : "scheduled";
  return { listingId: request.listingId, processedImageId: processed.image_id, inspection: reminder, maintenanceRequest: request.maintenanceRequest, tenantDocument: request.tenantDocument };
}
