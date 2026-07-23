import { faker } from "@faker-js/faker";

// State codes used in the first two digits of a GSTIN (subset covering
// where an Indian SaaS company's vendors would realistically be registered).
const STATE_CODES: Record<string, string> = {
  Karnataka: "29",
  Maharashtra: "27",
  Delhi: "07",
  TamilNadu: "33",
  Telangana: "36",
  Haryana: "06",
  WestBengal: "19",
  Gujarat: "24",
};
const STATE_NAMES = Object.keys(STATE_CODES);

const BANK_IFSC_PREFIXES = ["HDFC", "ICIC", "SBIN", "UTIB", "KKBK", "PUNB", "UBIN", "IDFB", "YESB", "INDB"];

const INDIAN_FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Rohan",
  "Karan", "Aryan", "Kabir", "Dhruv", "Rudra", "Yash", "Advait", "Sameer", "Nikhil", "Varun",
  "Ananya", "Diya", "Saanvi", "Aadhya", "Kiara", "Myra", "Anika", "Navya", "Pari", "Ira",
  "Priya", "Sneha", "Kavya", "Meera", "Riya", "Tanvi", "Neha", "Pooja", "Divya", "Shreya",
  "Rajesh", "Suresh", "Ramesh", "Mahesh", "Vikram", "Ashok", "Deepak", "Manoj", "Sanjay", "Anil",
  "Sunita", "Lakshmi", "Geeta", "Rekha", "Kavita", "Anjali", "Swati", "Nisha", "Preeti", "Ritu",
];
const INDIAN_LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Kumar", "Singh", "Patel", "Reddy", "Rao", "Nair", "Iyer",
  "Menon", "Pillai", "Chatterjee", "Banerjee", "Mukherjee", "Das", "Bose", "Agarwal", "Bansal", "Mehta",
  "Shah", "Joshi", "Desai", "Kulkarni", "Naidu", "Chandra", "Malhotra", "Kapoor", "Chopra", "Bhatia",
  "Rastogi", "Saxena", "Trivedi", "Pandey", "Mishra", "Tiwari", "Yadav", "Choudhary", "Gowda", "Hegde",
];

const VENDOR_NAME_PREFIXES = [
  "Nova", "Bharat", "Meridian", "Vertex", "Silverline", "Crestview", "Bluewave", "Northstar", "Sundar",
  "Kaveri", "Ganga", "Indus", "Zenith", "Pinnacle", "Orbit", "Skyline", "Lakeside", "Redwood", "Greenfield",
  "Sunrise", "Metro", "Prime", "Apex", "Trident", "Horizon", "Cascade", "Falcon", "Everest", "Anvil",
];
const VENDOR_NAME_SUFFIXES = [
  "Technologies", "Solutions", "Systems", "Consulting", "Enterprises", "Industries", "Logistics",
  "Software", "Infotech", "Digital", "Networks", "Innovations", "Ventures", "Traders", "Services",
];
const VENDOR_LEGAL_SUFFIXES = ["Pvt Ltd", "LLP", "Pvt Ltd"];

/** Real, recognizable vendors an Indian enterprise SaaS company would actually pay. */
export const SEED_VENDORS = [
  "Amazon Web Services India Pvt Ltd",
  "Microsoft India Pvt Ltd",
  "Google Cloud India Pvt Ltd",
  "Zoho Corporation Pvt Ltd",
  "Freshworks Technologies Pvt Ltd",
  "Tata Communications Ltd",
  "Reliance Jio Infocomm Ltd",
  "Dell International Services India Pvt Ltd",
  "Lenovo India Pvt Ltd",
  "Adobe Systems India Pvt Ltd",
  "HubSpot India Pvt Ltd",
  "Notion Labs India Pvt Ltd",
  "Slack Technologies India Pvt Ltd",
  "Twilio India Pvt Ltd",
  "OpenAI India Services Pvt Ltd",
  "Anthropic India Pvt Ltd",
  "Oracle Financial Services Software Ltd",
  "SAP India Pvt Ltd",
  "Tata Consultancy Services Ltd",
  "Infosys BPM Ltd",
  "Wipro Enterprises Pvt Ltd",
  "Larsen & Toubro Infotech Ltd",
  "HCL Technologies Ltd",
  "Tech Mahindra Ltd",
  "Zscaler India Pvt Ltd",
  "Atlassian India Pvt Ltd",
  "Salesforce India Pvt Ltd",
  "Cisco Systems India Pvt Ltd",
  "Airtel Business (Bharti Airtel Ltd)",
  "Netmagic IT Services Pvt Ltd",
];

export function pick<T>(arr: readonly T[]): T {
  const item = arr[Math.floor(Math.random() * arr.length)];
  if (item === undefined) throw new Error("pick() called on empty array");
  return item;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function indianFullName(): string {
  return `${pick(INDIAN_FIRST_NAMES)} ${pick(INDIAN_LAST_NAMES)}`;
}

export function companyDomain(companySlug: string): string {
  return `${companySlug}.co.in`;
}

export function employeeEmail(fullName: string, domain: string): string {
  const [first, last] = fullName.toLowerCase().split(" ");
  return `${first}.${last}${randomInt(1, 99)}@${domain}`;
}

export function indianPhone(): string {
  return `+91 9${randomInt(100000000, 999999999)}`;
}

export function generatedVendorName(): string {
  return `${pick(VENDOR_NAME_PREFIXES)} ${pick(VENDOR_NAME_SUFFIXES)} ${pick(VENDOR_LEGAL_SUFFIXES)}`;
}

/** Structurally valid (regex-passing) GSTIN — not a real registered number. */
export function generateGSTIN(state: string = pick(STATE_NAMES)): string {
  const stateCode = STATE_CODES[state] ?? "29";
  const panLike = generatePAN();
  const entityCode = pick("123456789".split(""));
  const checksum = pick("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
  return `${stateCode}${panLike}${entityCode}Z${checksum}`;
}

/** Structurally valid (regex-passing) PAN — not a real allotted number. */
export function generatePAN(): string {
  const letters = () =>
    Array.from({ length: 5 }, () => pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))).join("");
  const digits = randomInt(1000, 9999);
  const lastLetter = pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
  return `${letters()}${digits}${lastLetter}`;
}

export function generateIFSC(): string {
  const bank = pick(BANK_IFSC_PREFIXES);
  const branch = Array.from({ length: 6 }, () => pick("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))).join("");
  return `${bank}0${branch}`;
}

export function generateAccountNumber(): string {
  return String(randomInt(100000000000, 999999999999));
}

export function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

/** Random timestamp uniformly distributed across the last `maxDaysAgo` days. */
export function randomRecentDate(maxDaysAgo: number): Date {
  return daysAgo(randomInt(0, maxDaysAgo));
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export { faker };
