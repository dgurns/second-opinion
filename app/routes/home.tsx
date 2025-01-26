import type { Route } from "./+types/home";
import { useFetcher, useLoaderData } from "react-router";
import { useEffect, useRef } from "react";
import { db } from "~/db";
import { medicalDetailsTable } from "~/db/schema";

export async function loader() {
  const details = await db.select().from(medicalDetailsTable).orderBy(medicalDetailsTable.created_at);
  return { details };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Second Opinion" },
    { name: "description", content: "Get a second opinion on your medical details" },
  ];
}

export default function Home() {
  const { details } = useLoaderData<typeof loader>();
  const detailsFetcher = useFetcher();
  const secondOpinionFetcher = useFetcher();
  const clearFetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmittingDetails = detailsFetcher.state === "submitting";
  const isGettingOpinion = secondOpinionFetcher.state === "submitting";
  const isClearing = clearFetcher.state === "submitting";

  // Reset form after successful submission
  useEffect(() => {
    if (detailsFetcher.data?.ok && formRef.current) {
      formRef.current.reset();
    }
  }, [detailsFetcher.data]);

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Submit Medical Details</h1>
        <clearFetcher.Form method="post" action="/clear-details">
          <button
            type="submit"
            disabled={isClearing}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {isClearing ? "Clearing..." : "Clear All"}
          </button>
        </clearFetcher.Form>
      </div>

      {details.length > 0 && (
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold">Previous Medical Details</h2>
          <div className="space-y-3">
            {details.map((detail, index) => (
              <div key={detail.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(detail.created_at).toLocaleString()}
                </div>
                <div className="whitespace-pre-wrap">{detail.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <detailsFetcher.Form 
        ref={formRef}
        method="post" 
        action="/medical-details" 
        className="space-y-4"
      >
        <div>
          <label htmlFor="details" className="block text-sm font-medium mb-2">
            Medical Details
          </label>
          <textarea
            id="details"
            name="details"
            required
            className="w-full h-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your medical details here..."
          />
        </div>
        <button
          type="submit"
          disabled={isSubmittingDetails}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmittingDetails ? "Submitting..." : "Submit"}
        </button>
      </detailsFetcher.Form>

      <div className="mt-8">
        <secondOpinionFetcher.Form method="post" action="/second-opinion">
          <button
            type="submit"
            disabled={isGettingOpinion}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isGettingOpinion ? "Getting Opinion..." : "Get Second Opinion"}
          </button>
        </secondOpinionFetcher.Form>

        {secondOpinionFetcher.data?.diagnosis && (
          <div className="mt-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">AI Second Opinion</h2>
            <div className="whitespace-pre-wrap">{secondOpinionFetcher.data.diagnosis}</div>
          </div>
        )}
      </div>
    </main>
  );
}
