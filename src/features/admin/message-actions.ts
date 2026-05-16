"use server";

import { revalidatePath } from "next/cache";

import { requireAdminCapability } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";

function getMessageId(formData: FormData) {
  const id = formData.get("id");
  return typeof id === "string" && id.length > 0 ? id : null;
}

async function updateMessageStatus(formData: FormData, status: "APPROVED" | "HIDDEN") {
  await requireAdminCapability("moderation");

  const id = getMessageId(formData);

  if (!id) {
    return;
  }

  await prisma.message.update({
    where: { id },
    data: { status }
  });

  revalidatePath("/messages");
  revalidatePath("/admin/content/messages");
  revalidatePath("/admin");
}

export async function approveMessage(formData: FormData) {
  await updateMessageStatus(formData, "APPROVED");
}

export async function hideMessage(formData: FormData) {
  await updateMessageStatus(formData, "HIDDEN");
}
