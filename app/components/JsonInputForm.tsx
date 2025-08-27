import { useState } from "react";
import { Form, useTransition } from "remix";

export function JsonInputForm() {
  const transition = useTransition();
  const [activeTab, setActiveTab] = useState<'url' | 'json'>('url');
  const [urlValue, setUrlValue] = useState("");
  const [jsonValue, setJsonValue] = useState("");
  const [titleValue, setTitleValue] = useState("");

  const isNotIdle = transition.state !== "idle";

  const isUrlDisabled = !urlValue.length || isNotIdle;
  const isJsonDisabled = !jsonValue.length || isNotIdle;

  const isValidJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const hasValidJsonContent = jsonValue.trim() && isValidJson(jsonValue.trim());

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-6 py-3 text-sm font-medium font-inter transition-colors border-b-2 ${
            activeTab === 'url'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          JSON URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('json')}
          className={`px-6 py-3 text-sm font-medium font-inter transition-colors border-b-2 ${
            activeTab === 'json'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Paste JSON
        </button>
      </div>

      {/* URL Form */}
      {activeTab === 'url' && (
        <Form method="post" action="/actions/createFromUrl">
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                name="jsonUrl"
                id="jsonUrl"
                className="block flex-grow text-base text-gray-700 placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg py-3 px-4 font-inter transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="https://api.example.com/data.json"
                value={urlValue}
                onChange={(event) => setUrlValue(event.target.value)}
              />
              <button
                type="submit"
                className={`inline-flex items-center justify-center px-8 py-3 border border-transparent font-medium font-inter rounded-lg text-white bg-blue-600 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isUrlDisabled && "disabled:opacity-50 disabled:hover:bg-blue-600"
                }`}
                disabled={isUrlDisabled}
              >
                {isNotIdle ? "Loading..." : "Open"}
              </button>
            </div>
          </div>
        </Form>
      )}

      {/* JSON Form */}
      {activeTab === 'json' && (
        <Form method="post" action="/actions/createFromUrl">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 font-inter mb-2">
                File Name (optional)
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="block w-full text-base text-gray-700 placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg py-3 px-4 font-inter transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="My JSON Data"
                value={titleValue}
                onChange={(event) => setTitleValue(event.target.value)}
              />
            </div>

            {/* JSON Textarea */}
            <div>
              <label htmlFor="jsonUrl" className="block text-sm font-medium text-gray-700 font-inter mb-2">
                JSON Content
              </label>
              <textarea
                name="jsonUrl"
                id="jsonUrl"
                rows={12}
                className={`block w-full text-sm text-gray-700 placeholder:text-gray-400 bg-white border rounded-lg py-3 px-4 font-mono transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-y ${
                  jsonValue.trim() && !isValidJson(jsonValue.trim())
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder={`{
  "name": "John Doe",
  "age": 30,
  "city": "New York"
}`}
                value={jsonValue}
                onChange={(event) => setJsonValue(event.target.value)}
              />
              {jsonValue.trim() && !isValidJson(jsonValue.trim()) && (
                <p className="mt-2 text-sm text-red-600 font-inter">
                  Invalid JSON format. Please check your syntax.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className={`inline-flex items-center justify-center px-8 py-3 border border-transparent font-medium font-inter rounded-lg text-white bg-blue-600 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (!hasValidJsonContent || isNotIdle) && "disabled:opacity-50 disabled:hover:bg-blue-600"
                }`}
                disabled={!hasValidJsonContent || isNotIdle}
              >
                {isNotIdle ? "Processing..." : "Create JSON Document"}
              </button>
            </div>
          </div>
        </Form>
      )}
    </div>
  );
}
