import "dotenv/config";
import { createLogger } from "@pazy-pro/logging";
import { startInvoiceOcrWorker } from "./invoiceOcr";
import { startInvoiceMatchingWorker } from "./invoiceMatching";
import { startVendorVerificationWorker } from "./vendorVerification";
import { startRiskScoringWorker } from "./riskScoring";
import { startPaymentExecutionWorker } from "./paymentExecution";
import { startPaymentGatewayCallbackWorker } from "./paymentGatewayCallback";

const logger = createLogger("worker");

startInvoiceOcrWorker();
startInvoiceMatchingWorker();
startVendorVerificationWorker();
startRiskScoringWorker();
startPaymentExecutionWorker();
startPaymentGatewayCallbackWorker();

logger.info("PazyPro background workers started");
