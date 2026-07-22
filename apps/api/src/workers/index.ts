import { createLogger } from "@pazy-pro/logging";
import { startInvoiceOcrWorker } from "./invoiceOcr";

const logger = createLogger("worker");

startInvoiceOcrWorker();
logger.info("PazyPro background workers started");
