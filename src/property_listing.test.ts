import test from "node:test";
import assert from "node:assert/strict";
import { listingRequest } from "./property_listing.js";

test("listing input defaults format and marks an overdue inspection", () => {
  const parsed = listingRequest.parse({ listingId: "apt-7", image: "data:image/png;base64,abc", inspectionDue: "2020-01-01" });
  assert.equal(parsed.format, "png");
  assert.equal(parsed.listingId, "apt-7");
  assert.ok(parsed.inspectionDue && parsed.inspectionDue < new Date());
});
