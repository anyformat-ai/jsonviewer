import { useState } from "react";
import { Form, useTransition } from "remix";

export type UrlFormProps = {
  className?: string;
};

export function UrlForm({ className }: UrlFormProps) {
  const transition = useTransition();
  const [inputValue, setInputValue] = useState("");

  const isNotIdle = transition.state !== "idle";
  const isButtonDisabled = !inputValue.length || isNotIdle;

  return (
    <Form
      method="post"
      action="/actions/createFromUrl"
      className={`${className}`}
    >
      <div className="flex max-w-2xl mx-auto">
        <input
          type="text"
          name="jsonUrl"
          id="jsonUrl"
          className="block flex-grow text-base text-gray-700 placeholder:text-gray-400 bg-white border border-gray-300 rounded-l-lg py-3 px-4 font-inter transition duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          placeholder="Enter a JSON URL or paste JSON here..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button
          type="submit"
          value="Go"
          className={`inline-flex items-center justify-center px-6 py-3 border border-transparent font-medium font-inter rounded-r-lg text-white bg-blue-600 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isButtonDisabled && "disabled:opacity-50 disabled:hover:bg-blue-600"
          }`}
          disabled={isButtonDisabled}
        >
          {isNotIdle ? "Loading..." : "Open"}
        </button>
      </div>
    </Form>
  );
}
