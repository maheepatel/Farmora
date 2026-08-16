import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const DATA_FILE = join(process.cwd(), "frontend", "data", "waitlist.json");

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  ip?: string;
}

async function ensureDataFile() {
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "[]", "utf8");
  }
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, hp } = body;

    if (hp) {
      return NextResponse.json({ success: true });
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!validateName(name)) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await ensureDataFile();
    const data = JSON.parse(await readFile(DATA_FILE, "utf8")) as WaitlistEntry[];

    const existing = data.find((e) => e.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json(
        { error: "This email is already on the waitlist" },
        { status: 409 }
      );
    }

    const entry: WaitlistEntry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    };

    data.unshift(entry);
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Waitlist POST error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminSecret = request.headers.get("x-admin-secret");
    const expectedSecret = process.env.WAITLIST_ADMIN_SECRET;

    if (!expectedSecret || adminSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await ensureDataFile();
    const data = JSON.parse(await readFile(DATA_FILE, "utf8")) as WaitlistEntry[];

    return NextResponse.json({ entries: data, total: data.length });
  } catch (error) {
    console.error("Waitlist GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist" },
      { status: 500 }
    );
  }
}