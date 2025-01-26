import type { ActionFunctionArgs } from "react-router";
import { db } from "~/db";
import { medicalDetailsTable } from "~/db/schema";
import { eq } from "drizzle-orm";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const id = formData.get("id");

  if (!id) {
    return { ok: false, error: "No id provided" };
  }

  await db
    .delete(medicalDetailsTable)
    .where(eq(medicalDetailsTable.id, Number(id)));
  return { ok: true };
};
