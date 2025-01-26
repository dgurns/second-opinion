import type { ActionFunctionArgs } from "react-router";
import { db } from "~/db";
import { medicalDetailsTable } from "~/db/schema";
import { redirect } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
  await db.delete(medicalDetailsTable);
  return redirect("/");
} 