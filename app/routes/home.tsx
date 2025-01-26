import type { Route } from "./+types/home";
import { useFetcher, useLoaderData } from "react-router";
import { useEffect, useRef, useState } from "react";
import { db } from "~/db";
import { medicalDetailsTable } from "~/db/schema";

export async function loader() {
  const details = await db
    .select()
    .from(medicalDetailsTable)
    .orderBy(medicalDetailsTable.created_at);
  return { details };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Second Opinion" },
    {
      name: "description",
      content: "Get a second opinion on your medical details",
    },
  ];
}

export default function Home() {
  const { details } = useLoaderData<typeof loader>();
  const detailsFetcher = useFetcher();
  const secondOpinionFetcher = useFetcher();
  const clearFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const [streamedResponse, setStreamedResponse] = useState("");
  const isSubmittingDetails = detailsFetcher.state === "submitting";
  const isGettingOpinion = secondOpinionFetcher.state === "submitting";
  const isClearing = clearFetcher.state === "submitting";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  // Reset form after successful submission
  useEffect(() => {
    if (detailsFetcher.data?.ok && formRef.current) {
      formRef.current.reset();
    }
  }, [detailsFetcher.data]);

  // Handle streaming response
  useEffect(() => {
    let abortController: AbortController | null = null;

    if (secondOpinionFetcher.state === "submitting") {
      setStreamedResponse("");
      const fetchStream = async () => {
        try {
          abortController = new AbortController();
          const response = await fetch("/second-opinion", {
            method: "POST",
            signal: abortController.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) return;

          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            setStreamedResponse((prev) => prev + text);
          }
        } catch (error: unknown) {
          if (error instanceof Error && error.name === "AbortError") {
            console.log("Fetch aborted");
          } else {
            console.error("Error reading stream:", error);
          }
        }
      };
      fetchStream();
    }

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [secondOpinionFetcher.state]);

  return (
    <main className="container mx-auto p-4 mb-24">
      {details.length > 0 && (
        <details className="mb-8">
          <summary className="text-lg font-semibold cursor-pointer hover:text-gray-300 mb-4">
            Previous Medical Details ({details.length})
          </summary>
          <div className="space-y-4">
            <div className="space-y-3">
              {details.map((detail) => (
                <div key={detail.id} className="rounded-lg">
                  <div className="flex items-center mb-1">
                    <div className="text-sm text-gray-500">
                      {new Date(detail.created_at).toLocaleString()}
                    </div>
                    <deleteFetcher.Form
                      method="post"
                      action="/delete-detail"
                      className="inline"
                    >
                      <input type="hidden" name="id" value={detail.id} />
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 underline text-sm ml-2"
                      >
                        Delete
                      </button>
                    </deleteFetcher.Form>
                  </div>
                  <div className="whitespace-pre-wrap">{detail.details}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
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
          </div>
        </details>
      )}

      <detailsFetcher.Form
        ref={formRef}
        method="post"
        action="/medical-details"
        className="space-y-4"
      >
        <div>
          <label htmlFor="details" className="block text-sm font-medium mb-2">
            Medical Details or Questions
          </label>
          <textarea
            id="details"
            name="details"
            required
            onKeyDown={handleKeyDown}
            className="w-full h-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your medical details or questions here... (Press Cmd+Enter to submit)"
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

        {streamedResponse && (
          <div className="my-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">AI Second Opinion</h2>
            <div className="whitespace-pre-wrap">{streamedResponse}</div>
          </div>
        )}
      </div>
    </main>
  );
}
