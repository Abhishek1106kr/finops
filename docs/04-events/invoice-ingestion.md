# Event Contract: Invoice Ingestion

Stream: `pazypro:events` (Redis Streams) · Envelope schema: `EventEnvelopeSchema` (`packages/types/src/events.ts`)

## Flow

```
POST /api/v1/invoices (multipart upload)
        │
        ▼
InvoiceUploaded ──► invoice-ocr queue job
        │
        ▼
InvoiceParsed + OCRCompleted ──► invoice-matching queue job
        │
        ▼
InvoiceMatched ──► ApprovalRequested (future: budget/vendor checks)
```

## Events

| Event | Producer | Payload schema | Idempotency key |
| --- | --- | --- | --- |
| `InvoiceUploaded` | `apps/api` invoices route | `InvoiceUploadedPayload` | `invoice:{invoiceId}:uploaded` |
| `InvoiceParsed` | `invoice-ocr` worker | `InvoiceParsedPayload` | `invoice:{invoiceId}:parsed:{jobId}` |
| `OCRCompleted` | `invoice-ocr` worker | `OCRCompletedPayload` | `invoice:{invoiceId}:ocr-completed:{jobId}` |
| `InvoiceMatched` | `invoice-matching` worker (not yet implemented) | `InvoiceMatchedPayload` | `invoice:{invoiceId}:matched:{jobId}` |

## Idempotency & retries
- File uploads are deduplicated by SHA-256 content hash (`Invoice.fileHash` is
  a unique constraint) — re-uploading identical bytes returns the existing
  invoice rather than creating a duplicate or re-publishing events.
- Every `publishEvent()` call passes an `idempotencyKey`; a second publish
  with the same key is a guaranteed no-op (Redis `SETNX`).
- BullMQ jobs use `jobId` derived from the invoice id (e.g. `ocr:{invoiceId}`)
  so retried/duplicate enqueues collapse into a single job.
- Worker failures retry with exponential backoff (5 attempts, see
  `libs/events/src/queues.ts`); after exhaustion the job lands in the failed
  set for the Audit Agent / on-call to inspect via Bull Board.

## Monitoring
- Worker logs `invoice.ocr.completed` / `invoice.ocr.failed` (Pino, structured).
- `GET /readyz` reports Postgres + Redis connectivity for uptime checks.
- TODO: Prometheus counters for events published per type and queue lag
  (`docs/09-monitoring`).
