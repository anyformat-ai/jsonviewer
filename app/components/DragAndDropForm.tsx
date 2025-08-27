import { ArrowCircleDownIcon } from "@heroicons/react/outline";
import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Form, useSubmit } from "remix";
import invariant from "tiny-invariant";

export function DragAndDropForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const filenameInputRef = useRef<HTMLInputElement>(null);
  const rawJsonInputRef = useRef<HTMLInputElement>(null);

  const submit = useSubmit();

  const onDrop = useCallback(
    (acceptedFiles: Array<File>) => {
      if (!formRef.current || !filenameInputRef.current) {
        return;
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      const firstFile = acceptedFiles[0];

      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        if (reader.result == null) {
          return;
        }

        let jsonValue: string | undefined = undefined;

        if (typeof reader.result === "string") {
          jsonValue = reader.result;
        } else {
          const decoder = new TextDecoder("utf-8");
          jsonValue = decoder.decode(reader.result);
        }

        invariant(rawJsonInputRef.current, "rawJsonInputRef is null");
        invariant(jsonValue, "jsonValue is undefined");

        rawJsonInputRef.current.value = jsonValue;

        submit(formRef.current);
      };
      reader.readAsArrayBuffer(firstFile);
      filenameInputRef.current.value = firstFile.name;
    },
    [formRef.current, filenameInputRef.current, rawJsonInputRef.current]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted: onDrop,
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5, // Increased to 5MB
    multiple: false,
    accept: ".json,.txt,application/json,text/plain",
  });

  return (
    <Form method="post" action="/actions/createFromFile" ref={formRef}>
      <div
        {...getRootProps()}
                         className={`block w-full cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 text-center ${
                   isDragActive
                     ? "border-blue-500 bg-blue-50 text-blue-600"
                     : "border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400 hover:bg-gray-100"
                 } p-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-6">
          <ArrowCircleDownIcon
            className={`h-20 w-20 ${
              isDragActive ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <div>
            <p className={`text-2xl font-medium font-inter ${isDragActive ? "text-blue-600" : "text-gray-700"}`}>
              {isDragActive ? "Drop to open it" : "Drop your JSON file here"}
            </p>
            <p className="text-lg text-gray-500 mt-3 font-inter">
              or click to browse files
            </p>
            <p className="text-sm text-gray-400 mt-2 font-inter">
              Supports .json and .txt files up to 5MB
            </p>
          </div>
        </div>

        <input type="hidden" name="filename" ref={filenameInputRef} />
        <input type="hidden" name="rawJson" ref={rawJsonInputRef} />
      </div>
    </Form>
  );
}
