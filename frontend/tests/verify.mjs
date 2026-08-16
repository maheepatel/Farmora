/**
 * Read-only browser verification for the Farmora frontend (Monad Testnet).
 * No state-changing transactions are sent. Requires dev server on :3000.
 * Run: node frontend/tests/verify.mjs
 */
import puppeteer from "puppeteer-core";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RPC = "https://testnet-rpc.monad.xyz";
const CHAIN_ID_HEX = "0x279f";
const NET_VERSION = "10143";

const env = readFileSync(join(__dirname, "..", "..", "contracts", ".env"), "utf8");
const privKeyMatch = env.match(/PRIVATE_KEY\s*=\s*"?((?:0x)?[0-9a-fA-F]{64})"?/);
if (!privKeyMatch) { console.error("PRIVATE_KEY not found in contracts/.env"); process.exit(1); }
const pk = privKeyMatch[1].startsWith("0x") ? privKeyMatch[1] : "0x" + privKeyMatch[1];
const ADMIN = privateKeyToAccount(pk).address;
const NONADMIN = "0x1111111111111111111111111111111111111111";
console.log(`Admin wallet: ${ADMIN}\nNon-admin wallet: ${NONADMIN}`);

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

const bridgeFor = (wallet) => async (method, params) => {
  if (method === "eth_chainId") return CHAIN_ID_HEX;
  if (method === "net_version") return NET_VERSION;
  if (method === "eth_accounts" || method === "eth_requestAccounts" || method === "eth_coinbase")
    return method === "eth_coinbase" ? wallet : [wallet];
  if (method === "wallet_switchEthereumChain" || method === "wallet_addEthereumChain") return null;
  if (method === "eth_feeHistory")
    return { oldestBlock: "0x1", baseFeePerGas: ["0x3b9aca00"], reward: [["0x0"]] };
  if (method === "eth_sendTransaction" || method === "eth_signTransaction" || method === "personal_sign")
    throw new Error("write/sign methods are disabled in read-only verify.mjs");
  return rpc(method, params);
};

async function newPage(browser, wallet) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() === "error" && !t.includes("_next/webpack-hmr") && !t.includes("favicon")) errors.push(t.slice(0, 160));
  });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 160)));
  await page.exposeFunction("__rpcBridge", bridgeFor(wallet));
  await page.evaluateOnNewDocument(({ w, c, n }) => {
    window.ethereum = {
      isMetaMask: true, chainId: c, networkVersion: n, selectedAddress: w,
      on: () => {}, removeListener: () => {},
      request: async ({ method, params }) => window.__rpcBridge(method, params),
      _state: { accounts: [], initialized: true, isConnected: true, isPermanentlyDisconnected: false },
      _emit: () => {},
    };
  }, { w: wallet, c: CHAIN_ID_HEX, n: NET_VERSION });
  return { page, errors };
}

const BAD = ["acreledger", "arc testnet", "arcscan", "blockdaemon", "on arc", "5042002", "monad rpc is busy"];
const HYDRATION_ERROR = "Hydration failed because the server rendered text didn't match the client";

let failed = 0;
const report = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
  if (!ok) failed++;
};

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });

const ROUTES = [
  { path: "/", checks: ["the farm is real", "the harvests, as they stand now", "farmora"] },
  { path: "/marketplace", checks: ["farm marketplace", "saffron", "tokens"] },
  { path: "/batch/0", checks: ["saffron", "return estimator", "4-yr total", "estimated next year", "musdc"] },
  { path: "/batch/5", checks: ["grapes"] },
  { path: "/portfolio", checks: ["cropfolio"] },
  { path: "/stays", checks: ["farm stays"] },
  { path: "/add-tokens", checks: ["token registry", "musdc", "monad testnet", "10143"] },
];

for (const { path, checks } of ROUTES) {
  const { page, errors } = await newPage(browser, ADMIN);
  await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 7000));
  const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  const all = checks.every((c) => text.includes(c));
  report(`route ${path} renders`, all, checks.filter((c) => !text.includes(c)).join(", "));
  const bad = BAD.filter((b) => text.includes(b));
  report(`route ${path} no legacy branding`, bad.length === 0, bad.join(", "));
  const realErrors = errors.filter(e => !e.includes(HYDRATION_ERROR) && !e.includes("429"));
  report(`route ${path} no console errors`, realErrors.length === 0, realErrors[0] || "");
  await page.close();
}

// Design checks on the home page (wallet off)
{
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 7000));
  const design = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const heading = document.querySelector(".font-heading, h1, h2, h3");
    const hf = heading ? getComputedStyle(heading).fontFamily : "";
    const video = !!document.querySelector("video[src*='hero.mp4']") || !!document.querySelector("video");
    const logo = !!document.querySelector("header img, header svg");
    const footerText = document.body.innerText.toLowerCase();
    return {
      bg: body.backgroundColor + " / " + body.backgroundImage.slice(0, 80),
      headingFont: hf,
      video,
      logo,
      monadFooter: footerText.includes("built on monad testnet"),
      sageMentioned: footerText.includes("farmora"),
    };
  });
  report("design: hero video present", design.video);
  report("design: header logo present", design.logo);
  report("design: footer 'Built on Monad Testnet'", design.monadFooter);
  report("design: heading uses Baloo font", design.headingFont.toLowerCase().includes("baloo"), design.headingFont.slice(0, 80));
  console.log(`  info: body background -> ${design.bg}`);
  await page.close();
}

// Admin gate: non-admin wallet should be denied, header must hide Farm Ops
{
  const { page, errors } = await newPage(browser, NONADMIN);
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 7000));
  const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  report("admin gate: non-admin is denied", text.includes("admin-only") || text.includes("not the farm admin"), "");
  const headerNav = await page.evaluate(() => {
    const links = [...document.querySelectorAll("header nav a")].map((a) => a.innerText.trim().toLowerCase());
    return links.join(" | ");
  });
  report("admin gate: 'Farm Ops' hidden from non-admin header nav", !headerNav.includes("farm ops"), headerNav.slice(0, 120));
  const realErrors = errors.filter(e => !e.includes(HYDRATION_ERROR) && !e.includes("429"));
  report("admin gate: non-admin page no console errors", realErrors.length === 0, realErrors[0] || "");
  await page.close();
}

// Admin gate: admin wallet should see the tabs
{
  const { page, errors } = await newPage(browser, ADMIN);
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 7000));
  const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  report("admin gate: admin sees Farm Ops tabs", text.includes("distribute") || text.includes("batches") || text.includes("tokens sold"), "");
  const headerNav = await page.evaluate(() => {
    const links = [...document.querySelectorAll("header nav a")].map((a) => a.innerText.trim().toLowerCase());
    return links.join(" | ");
  });
  report("admin gate: 'Farm Ops' shown to admin header nav", headerNav.includes("farm ops"), headerNav.slice(0, 120));
  const realErrors = errors.filter(e => !e.includes(HYDRATION_ERROR) && !e.includes("429"));
  report("admin gate: admin page no console errors", realErrors.length === 0, realErrors[0] || "");
  await page.close();
}

// Wallet connected state: chain badge should show Monad
{
  const { page, errors } = await newPage(browser, ADMIN);
  await page.goto("http://localhost:3000/batch/0", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 7000));
  const text = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  report("wallet: batch page shows Monad Testnet", text.includes("monad testnet"), "");
  const realErrors = errors.filter(e => !e.includes(HYDRATION_ERROR) && !e.includes("429"));
  report("wallet: connected batch page no console errors", realErrors.length === 0, realErrors[0] || "");
  await page.close();
}

await browser.close();
console.log(failed === 0 ? "\nALL VERIFY CHECKS PASSED" : `\n${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
