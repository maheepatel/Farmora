import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BatchDetail } from "@/components/batch-detail";
import { getBatchMeta } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num) || num < 0 || num > 7) return { title: "Farmora" };
  const meta = getBatchMeta(num);
  return {
    title: `${meta.cropType} - Farmora`,
    description: meta.description,
  };
}

export default async function BatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num) || num < 0 || num > 7) notFound();
  return <BatchDetail id={num} />;
}
