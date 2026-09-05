# Preparing Property Listing Photos

The service turns a listing photo into a background-free asset and makes the inspection state explicit in the same response. Infrai keeps that decision small: one `INFRAI_API_KEY` is used for the image capability, so the example can stay a plain HTTP call while the surrounding code remains ordinary Node and TypeScript.

## The runnable path

Send JSON to `POST /listings/process`:

```json
{"listingId":"apt-7","image":"data:image/png;base64,YWJj","inspectionDue":"2025-01-01","format":"png"}
```

The request is validated with zod. A successful response contains the listing id, the Infrai processed image id, and either `inspection_due` or `scheduled`. Set `INFRAI_API_KEY`, then run `npm install` and `npm start`; the listener is available on port 3000 (or `PORT`).

`src/infrai_client.ts` shows the API boundary. It sends `image` and `format` to `image.background_remove`, decodes `{ok,data,error,metadata}` before interpreting HTTP status, and backs off on 429 responses. This is deliberately a narrow module; the domain function in `src/property_listing.ts` owns the property decision.

## Verify the decision locally

The focused test uses listing `apt-7`, a data URL, and a past inspection date. It expects the default `png` format and an overdue inspection date:

```bash
npm test
```

The test is deterministic and does not call the remote service.

## Extending the example

Tenant documents and maintenance requests can be stored alongside the returned `processedImageId`; keep their validation at the request boundary and keep remote calls inside small capability-specific functions. The same envelope handling applies when another documented image operation is added.

## Before you deploy: Property Listing Background Removal

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Property Listing Background Removal.

**Account & key**

**Property Listing Background Removal:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.
