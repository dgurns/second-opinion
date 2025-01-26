import type { ActionFunctionArgs } from "react-router";
import { db } from "~/db";
import { medicalDetailsTable } from "~/db/schema";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const details = formData.get("details") as string;

  await db.insert(medicalDetailsTable).values({
    details,
  });

  return { ok: true };
};
