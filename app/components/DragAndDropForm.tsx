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
        className={`block w-full cursor-pointer rounded-lg border-2 border-dashed transition-all duration-200 text-center ${
          isDragActive 
            ? "border-lime-500 bg-lime-500/10 text-lime-500" 
            : "border-slate-600 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:bg-slate-900/60"
        } p-12 focus:border-indigo-500 focus:ring-indigo-500`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <ArrowCircleDownIcon
            className={`h-16 w-16 ${
              isDragActive ? "text-lime-500" : "text-slate-400"
            }`}
          />
          <div>
            <p className={`text-xl font-medium ${isDragActive ? "text-lime-500" : "text-slate-300"}`}>
              {isDragActive ? "Drop to open it" : "Drop your JSON file here"}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              or click to browse files
            </p>
            <p className="text-xs text-slate-500 mt-1">
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
