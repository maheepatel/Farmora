/**
 * E2E for Farmora on Monad Testnet (chain 10143).
 * Requires dev server on http://localhost:3000 and contracts/deployed.json.
 * Run: node frontend/tests/e2e.mjs
 */
import puppeteer from "puppeteer-core";
import { privateKeyToAccount } from "viem/accounts";
import { encodeFunctionData, toFunctionSelector } from "viem";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RPC = "https://testnet-rpc.monad.xyz";
const CHAIN_ID = 10143;
const CHAIN_ID_HEX = "0x279f";
const NET_VERSION = String(10143);

const deployed = JSON.parse(readFileSync(join(__dirname, "..", "..", "contracts", "deployed.json"), "utf8"));
const USDC_ADDR = deployed.mockUSDC;
const BATCH_ADDRESSES = deployed.batches;
const STAY_ADDR = deployed.stayBooking;

const env = readFileSync(join(__dirname, "..", "..", "contracts", ".env"), "utf8");
const privKeyMatch = env.match(/PRIVATE_KEY\s*=\s*(0x[0-9a-fA-F]{64})/);
if (!privKeyMatch) { console.error("PRIVATE_KEY not found in contracts/.env"); process.exit(1); }
const account = privateKeyToAccount(privKeyMatch[1]);
const WALLET = account.address;
console.log(`Testing as wallet: ${WALLET}`);

const USDC_BAL_SEL = "0x70a08231000000000000000000000000" + WALLET.slice(2).toLowerCase();
const FAUCET_SEL = "0x3d7d3f5a";

const rpc = async (method, params = []) => {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`${method}: ${j.error.message}`);
  return j.result;
};

const bridge = async (method, params) => {
  if (method === "eth_chainId") return CHAIN_ID_HEX;
  if (method === "net_version") return NET_VERSION;
  if (method === "eth_accounts" || method === "eth_requestAccounts" || method === "eth_coinbase")
    return method === "eth_coinbase" ? WALLET : [WALLET];
  if (method === "wallet_switchEthereumChain" || method === "wallet_addEthereumChain") return null;
  if (method === "eth_feeHistory")
    return { oldestBlock: "0x1", baseFeePerGas: ["0x3b9aca00"], reward: [["0x0"]] };
  if (method === "eth_sendTransaction") {
    const tx = params[0];
    const nonce = tx.nonce ?? (await rpc("eth_getTransactionCount", [WALLET, "pending"]));
    const gasPrice = tx.gasPrice ?? (await rpc("eth_gasPrice", []));
    let gas = tx.gas;
    if (!gas) {
      try {
        gas = await rpc("eth_estimateGas", [{ from: WALLET, to: tx.to, data: tx.data, value: tx.value ?? "0x0" }]);
      } catch { gas = "0x5208"; }
    }
    const signed = await account.signTransaction({
      type: "legacy", chainId: CHAIN_ID, to: tx.to, data: tx.data,
      value: tx.value ? BigInt(tx.value) : 0n, gasPrice: BigInt(gasPrice),
      gas: BigInt(gas), nonce: BigInt(nonce),
    });
    console.log(`  [SIGNED ${tx.data.slice(0, 10)}... -> ${tx.to.slice(0, 8)}]`);
    return rpc("eth_sendRawTransaction", [signed]);
  }
  return rpc(method, params);
};

async function injectWallet(page) {
  await page.exposeFunction("__rpcBridge", bridge);
  await page.evaluateOnNewDocument(({ wallet, chainIdHex, netVer }) => {
    window.ethereum = {
      isMetaMask: true, chainId: chainIdHex, networkVersion: netVer, selectedAddress: wallet,
      on: () => {}, removeListener: () => {},
      request: async ({ method, params }) => window.__rpcBridge(method, params),
      _state: { accounts: [], initialized: true, isConnected: true, isPermanentlyDisconnected: false },
      _emit: () => {},
    };
  }, { wallet: WALLET, chainIdHex: CHAIN_ID_HEX, netVer: NET_VERSION });
}

async function typeInto(page, selector, value) {
  await page.evaluate(({ selector, value }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`input not found: ${selector}`);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, { selector, value });
}

async function waitForText(page, substr, timeoutMs = 150000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const text = await page.evaluate(() => document.body?.innerText ?? "");
    if (text.includes(substr)) return true;
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

async function waitForSelector(page, selector, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = await page.evaluate((sel) => !!document.querySelector(sel), selector);
    if (found) return true;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

const isHmrNoise = (text) => text.includes("_next/webpack-hmr");

async function ensureFunded(minUnits = 1000n) {
  const balHex = await rpc("eth_call", [{ to: USDC_ADDR, data: USDC_BAL_SEL }, "latest"]);
  const bal = BigInt(balHex || "0x0");
  if (bal >= minUnits * BigInt(10) ** BigInt(18)) return;
  const gasPrice = await rpc("eth_gasPrice", []);
  const nonce = await rpc("eth_getTransactionCount", [WALLET, "pending"]);
  const signed = await account.signTransaction({
    type: "legacy", chainId: CHAIN_ID, to: USDC_ADDR, data: FAUCET_SEL,
    value: 0n, gasPrice: BigInt(gasPrice), gas: 100000n, nonce: BigInt(nonce),
  });
  const hash = await rpc("eth_sendRawTransaction", [signed]);
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    const rc = await rpc("eth_getTransactionReceipt", [hash]).catch(() => null);
    if (rc && rc.status === "0x1") break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log("  [FAUCET minted mUSDC]");
}

let failed = 0;
const report = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });

// Test 1: pages render, no console errors
const pages = [
  { path: "/", checks: ["The farm is real", "The harvests, as they stand now"] },
  { path: "/marketplace", checks: ["Farm Marketplace", "Saffron"] },
  { path: "/portfolio", checks: ["Cropfolio"] },
  { path: "/batch/0", checks: ["Saffron"] },
  { path: "/admin", checks: ["Farm Ops", "Tokens Sold"] },
  { path: "/stays", checks: ["Farm Stays"] },
  { path: "/add-tokens", checks: ["token registry", "mUSDC", "Monad Testnet"] },
];
for (const { path, checks } of pages) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" && !isHmrNoise(m.text())) errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 200)));
  await injectWallet(page);
  await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6000));
  const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  const all = checks.every((c) => text.includes(c.toLowerCase()));
  report(`page ${path} renders`, all, checks.filter((c) => !text.includes(c.toLowerCase())).join(", "));
  report(`page ${path} no console errors`, errors.length === 0, errors[0] || "");
  await page.close();
}

// Test 1b: landing renders wallet-off
{
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6000));
  const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  report("landing renders wallet-off", text.includes("the farm is real"), "");
  await page.close();
}

// Test 1c: return estimator on all 8 batch pages
const BATCH_CROPS = ["Saffron", "Cordyceps", "Mushroom", "Dragon Fruit", "Pomegranate", "Grapes", "Turmeric", "Ginger"];
for (let i = 0; i < BATCH_CROPS.length; i++) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" && !isHmrNoise(m.text())) errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 200)));
  await injectWallet(page);
  await page.goto(`http://localhost:3000/batch/${i}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6000));
  const lower = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  const titleOk = lower.includes(BATCH_CROPS[i].toLowerCase());
  const estOk = lower.includes("return estimator") && ["2023", "2024", "2025", "2026"].every((y) => lower.includes(y))
    && lower.includes("4-yr total") && lower.includes("estimated next year");
  report(`estimator ${BATCH_CROPS[i]} (batch/${i})`, titleOk && estOk, `${titleOk ? "" : "title "}${estOk ? "" : "estimator/table"}`);
  report(`estimator ${BATCH_CROPS[i]} no console errors`, errors.length === 0, errors[0] || "");
  await page.close();
}

// Test 2: buy flow (pick a batch with available tokens)
const BATCH_TPA = [40000, 40000, 25000, 15000, 12000, 20000, 8000, 10000];
const availSel = toFunctionSelector("getAvailableTokens()");
let buyBatchId = -1;
for (let i = 0; i < BATCH_ADDRESSES.length; i++) {
  const availHex = await rpc("eth_call", [{ to: BATCH_ADDRESSES[i], data: availSel }, "latest"]);
  if (BigInt(availHex || "0x0") > 1n * BigInt(10) ** BigInt(18)) { buyBatchId = i; break; }
}
report("buy: found a batch with tokens available", buyBatchId >= 0, buyBatchId >= 0 ? `batch/${buyBatchId}` : "all sold out");
if (buyBatchId >= 0) {
  const buyPage = await browser.newPage();
  const buyErrors = [];
  buyPage.on("console", (m) => { if (m.type() === "error" && !isHmrNoise(m.text())) buyErrors.push(m.text().slice(0, 200)); });
  buyPage.on("pageerror", (e) => buyErrors.push("PAGEERROR: " + String(e).slice(0, 200)));
  await injectWallet(buyPage);
  await ensureFunded(1n);
  const buyAcres = (1.5 / BATCH_TPA[buyBatchId]).toString();
  await buyPage.goto(`http://localhost:3000/batch/${buyBatchId}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6000));
  await typeInto(buyPage, 'input[placeholder="1"]', buyAcres);
  await new Promise((r) => setTimeout(r, 1500));
  const buyBtn = await buyPage.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      ["Approve & Buy", "Buy Tokens", "Approving...", "Buying..."].some((t) => b.innerText.trim().startsWith(t)) && !b.disabled);
    if (btn) { btn.click(); return btn.innerText.trim(); }
    return null;
  });
  report("buy button clicked", !!buyBtn, buyBtn || "");
  const buyDone = await waitForText(buyPage, "Purchase successful!");
  report("buy flow completes", buyDone);
  report("buy page no console errors", buyErrors.length === 0, buyErrors[0] || "");
  await buyPage.close();
}

// Test 3: distribute revenue (auto-approve in UI)
const adminPage = await browser.newPage();
const adminErrors = [];
adminPage.on("console", (m) => { if (m.type() === "error" && !isHmrNoise(m.text())) adminErrors.push(m.text().slice(0, 200)); });
adminPage.on("pageerror", (e) => adminErrors.push("PAGEERROR: " + String(e).slice(0, 200)));
await injectWallet(adminPage);
await adminPage.goto("http://localhost:3000/admin", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 6000));
await typeInto(adminPage, 'input[placeholder="Revenue (mUSDC)"]', "1000");
await new Promise((r) => setTimeout(r, 1000));
const distClicked = await adminPage.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.innerText.trim() === "Distribute Revenue" && !b.disabled);
  if (btn) { btn.click(); return true; }
  return false;
});
report("distribute button clicked", distClicked);
await waitForText(adminPage, "Step 2/2", 30000).catch(() => {});
await waitForText(adminPage, "Done.", 180000);
report("distribute revenue completes", (await adminPage.evaluate(() => document.body.innerText)).includes("Done."));
report("admin no console errors", adminErrors.length === 0, adminErrors[0] || "");
await adminPage.close();

// Test 4: claim revenue
const portPage = await browser.newPage();
await injectWallet(portPage);
await portPage.goto("http://localhost:3000/portfolio", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 7000));
report("portfolio shows pending revenue", /Pending Revenue/.test(await portPage.evaluate(() => document.body.innerText)), "");
const claimClicked = await portPage.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => /Claim [\d,.]+ mUSDC/.test(b.innerText.trim()) && !b.disabled);
  if (btn) { btn.click(); return btn.innerText.trim(); }
  return null;
});
report("claim button clicked", !!claimClicked, claimClicked || "");
await waitForText(portPage, "Revenue claimed!", 180000);
report("claim completes", (await portPage.evaluate(() => document.body.innerText)).includes("Revenue claimed!"), "");
await portPage.close();

// Test 5: book a farm stay (on-chain)
const isoFromOffset = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
await ensureFunded(700n);
const staysPage = await browser.newPage();
const staysErrors = [];
staysPage.on("console", (m) => { if (m.type() === "error" && !isHmrNoise(m.text())) staysErrors.push(m.text().slice(0, 200)); });
staysPage.on("pageerror", (e) => staysErrors.push("PAGEERROR: " + String(e).slice(0, 200)));
await injectWallet(staysPage);
await staysPage.goto("http://localhost:3000/stays", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 6000));
const dateInputPresent = await waitForSelector(staysPage, 'input[type="date"]', 30000);
report("stays: date picker present", dateInputPresent);
let freeWeekend = false;
let bookedISO = null;
for (let offset = 10; offset <= 45 && !freeWeekend; offset++) {
  bookedISO = isoFromOffset(offset);
  await typeInto(staysPage, 'input[type="date"]', bookedISO);
  await new Promise((r) => setTimeout(r, 3500));
  const btnText = await staysPage.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.innerText.startsWith("Confirm booking") || x.innerText.startsWith("Pick another date"));
    return b ? b.innerText : "";
  });
  if (btnText.startsWith("Confirm booking")) freeWeekend = true;
}
report("stays: found a free weekend", freeWeekend, bookedISO || "");
const confirmClicked = await staysPage.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.innerText.startsWith("Confirm booking") && !b.disabled);
  if (btn) { btn.click(); return true; }
  return false;
});
report("stays: confirm booking clicked", confirmClicked);
const booked = await waitForText(staysPage, "Stay booked on-chain!", 180000);
report("stays: booking completes on-chain", booked);
report("stays: no console errors", staysErrors.length === 0, staysErrors[0] || "");
if (bookedISO) {
  const bookedDayNum = Math.floor(Date.parse(bookedISO + "T00:00:00Z") / 86400000);
  const callData = encodeFunctionData({ abi: [{ name: "isBooked", type: "function", stateMutability: "view", inputs: [{ name: "batchId", type: "uint256" }, { name: "day", type: "uint256" }], outputs: [{ name: "", type: "bool" }] }], functionName: "isBooked", args: [0, BigInt(bookedDayNum)] });
  const takenHex = await rpc("eth_call", [{ to: STAY_ADDR, data: callData }, "latest"]).catch(() => "0x0");
  report("stays: night taken on-chain (double-book guard)", BigInt(takenHex || "0x0") === 1n);
  const bookData = encodeFunctionData({ abi: [{ name: "bookStay", type: "function", stateMutability: "nonpayable", inputs: [{ name: "batchId", type: "uint256" }, { name: "day", type: "uint256" }, { name: "nights", type: "uint256" }, { name: "guests", type: "uint256" }], outputs: [] }], functionName: "bookStay", args: [0, BigInt(bookedDayNum), 2, 2] });
  let doubleBookReverts = false;
  try { await rpc("eth_call", [{ from: WALLET, to: STAY_ADDR, data: bookData }, "latest"]); }
  catch (e) { doubleBookReverts = String(e.message).toLowerCase().includes("stay already booked"); }
  report("stays: second bookStay reverts on-chain", doubleBookReverts);
}
await staysPage.close();

await browser.close();
console.log(failed === 0 ? "\nALL TESTS PASSED" : `\n${failed} TEST(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
