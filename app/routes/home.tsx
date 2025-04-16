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
  const streamedResponseContainerRef = useRef<HTMLDivElement>(null);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
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

  // Scroll to bottom when streamed response updates
  useEffect(() => {
    if (streamedResponseContainerRef.current) {
      streamedResponseContainerRef.current.scrollTo({
        top: streamedResponseContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [streamedResponse]);

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100">
      <header className="border-b border-gray-800 py-4">
        <div className="container mx-auto px-6">
          <img src="/logo.png" alt="Second Opinion" className="h-12" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <detailsFetcher.Form
                ref={formRef}
                method="post"
                action="/medical-details"
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-6">
                  <label
                    htmlFor="details"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Medical Details or Questions
                  </label>
                  <div className="relative">
                    <textarea
                      id="details"
                      name="details"
                      required
                      onKeyDown={handleKeyDown}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-200 placeholder-gray-600 transition-colors"
                      placeholder="Enter your medical details or questions here..."
                      rows={5}
                    />
                    <div className="absolute right-4 bottom-4 text-xs text-gray-500">
                      Press ⌘+Enter to submit
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingDetails}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isSubmittingDetails ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </detailsFetcher.Form>
            </div>

            {/* Previous Medical Details */}
            {details.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-400">
                    Previous Medical Details ({details.length})
                  </h2>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                      className="flex text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {isDetailsExpanded ? "Collapse" : "Expand"}
                    </button>
                    <clearFetcher.Form
                      method="post"
                      action="/clear-details"
                      onSubmit={(event) => {
                        if (
                          !window.confirm(
                            "Are you sure you want to clear all details?"
                          )
                        ) {
                          event.preventDefault(); // Prevent form submission if user cancels
                        }
                      }}
                    >
                      <button
                        type="submit"
                        disabled={isClearing}
                        className="flex text-xs text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50 disabled:hover:text-gray-500"
                      >
                        {isClearing ? "Clearing..." : "Clear All"}
                      </button>
                    </clearFetcher.Form>
                  </div>
                </div>

                {isDetailsExpanded && (
                  <div className="space-y-4">
                    {details.map((detail) => (
                      <div
                        key={detail.id}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-gray-500">
                            {new Date(detail.created_at).toLocaleString()}
                          </div>
                          <deleteFetcher.Form
                            method="post"
                            action="/delete-detail"
                          >
                            <input type="hidden" name="id" value={detail.id} />
                            <button
                              type="submit"
                              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          </deleteFetcher.Form>
                        </div>
                        <div className="text-sm text-gray-300 whitespace-pre-wrap">
                          {detail.details}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="mt-8 lg:mt-0 space-y-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 flex flex-col gap-6">
              <h2 className="text-sm font-medium text-gray-400">AI Analysis</h2>
              <secondOpinionFetcher.Form method="post" action="/second-opinion">
                <button
                  type="submit"
                  disabled={isGettingOpinion}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center mx-auto"
                >
                  {isGettingOpinion ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    "Get Second Opinion"
                  )}
                </button>
              </secondOpinionFetcher.Form>

              {streamedResponse ? (
                <div
                  ref={streamedResponseContainerRef}
                  className="text-sm text-gray-200 whitespace-pre-wrap p-4 bg-gray-800 rounded-lg border border-gray-700 max-h-[440px] overflow-y-auto"
                >
                  <div>{streamedResponse}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-left">
                  Enter your medical details and click the button above to get
                  an analysis.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
