# PazyPro — External Integrations Mock API Template (`MOCK_API_TEMPLATE.md`)

> **Standardized Integration Mocks for Production & Demo Environments**  
> *Endpoints simulating Bank Payouts, GST Portal, ERP Ledger Sync, Slack Webhooks, and Corporate Cards.*

---

## 1. Overview & Architectural Purpose

To ensure PazyPro remains resilient, testable, and fully functional without relying on external sandbox downtimes, all external integrations implement a standardized **Mock API Interface Envelope**. 

Every mock service returns realistic enterprise payloads with deterministic signatures, latency simulation (100ms–300ms), and error injection toggles.

---

## 2. Standard Mock API Response Envelope

All mock integration responses follow this unified JSON structure:

```json
{
  "provider": "GST_PORTAL_INDIA | PAZYPAY_BANK | SAP_ERP_ADAPTER | SLACK_WEBHOOK",
  "status": "SUCCESS | FAILED | PENDING",
  "timestamp": "2026-07-23T05:00:00.000Z",
  "requestId": "mock-req-9a8b7c6d",
  "data": {},
  "error": null
}
```

---

## 3. External Integration Mock Endpoints Matrix

| Integration Target | Mock Endpoint Path | Method | Primary Input | Expected Output Payload |
| :--- | :--- | :---: | :--- | :--- |
| **GST Portal Verification** | `/api/v1/mock/gst/verify` | `POST` | `{ gstin: "29AADCB9876E1ZQ" }` | Legal business name, active tax status, filing frequency, and state jurisdiction. |
| **Bank Payout Rail** | `/api/v1/mock/bank/payout-status` | `POST` | `{ gatewayRef: "PZP-IMPS-..." }` | Bank UTR reference code, settlement rail (`IMPS`/`NEFT`/`RTGS`), and clearance status. |
| **ERP Ledger Sync (SAP/NetSuite)** | `/api/v1/mock/erp/sync-invoice` | `POST` | `{ invoiceId: "...", glAccount: "..." }` | SAP Voucher Document Number (`VOUCHER-2026-X8`), posting date, and GL balance verification. |
| **Slack Webhook Nudge** | `/api/v1/mock/slack/notify` | `POST` | `{ channel: "#finance", message: "..." }` | Slack message timestamp (`ts`), delivery status, and interactive approval block ID. |
| **Corporate Card Authorization** | `/api/v1/mock/cards/authorize` | `POST` | `{ cardLast4: "4821", amount: 1500 }` | Approval code, Merchant Category Code (`MCC`), and spending policy check result. |

---

## 4. Detailed Mock Payloads Specification

### 4.1 GST Portal Verification (`/api/v1/mock/gst/verify`)
```json
{
  "provider": "GST_PORTAL_INDIA",
  "status": "SUCCESS",
  "timestamp": "2026-07-23T05:00:00.000Z",
  "requestId": "mock-gst-101",
  "data": {
    "gstin": "29AADCB9876E1ZQ",
    "legalName": "CloudScale Software Solutions Pvt Ltd",
    "tradeName": "CloudScale",
    "taxpayerType": "Regular",
    "gstinStatus": "Active",
    "stateJurisdiction": "Karnataka - Zone 1",
    "einvoiceEligible": true,
    "lastFiledPeriod": "2026-06"
  }
}
```

### 4.2 Bank Payout Rail (`/api/v1/mock/bank/payout-status`)
```json
{
  "provider": "PAZYPAY_BANK",
  "status": "SUCCESS",
  "timestamp": "2026-07-23T05:00:00.000Z",
  "requestId": "mock-bank-202",
  "data": {
    "gatewayReference": "PZP-IMPS-8A9F01B3C4D5",
    "settlementRail": "IMPS",
    "bankUtr": "UTR-20260723-99881122",
    "beneficiaryAccount": "918237465012",
    "beneficiaryIfsc": "HDFC0001234",
    "clearanceTimeMs": 140
  }
}
```

### 4.3 ERP Sync Adapter (`/api/v1/mock/erp/sync-invoice`)
```json
{
  "provider": "SAP_ERP_ADAPTER",
  "status": "SUCCESS",
  "timestamp": "2026-07-23T05:00:00.000Z",
  "requestId": "mock-erp-303",
  "data": {
    "invoiceId": "00000000-0000-0000-0000-000000000001",
    "sapVoucherNumber": "SAP-DOC-2026-90412",
    "glAccount": "GL-6020-CLOUD",
    "postingPeriod": "2026-07",
    "reconciled": true
  }
}
```
