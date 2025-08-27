import { ActionFunction, LoaderFunction, redirect } from "remix";
import invariant from "tiny-invariant";
import { sendEvent } from "~/graphJSON.server";
import { createFromRawJson } from "~/jsonDoc.server";

type CreateFromFileError = {
  filename?: boolean;
  rawJson?: boolean;
};

export const action: ActionFunction = async ({ request, context }) => {
  try {
    console.log('File upload action started');
    const formData = await request.formData();
    const filename = formData.get("filename");
    const rawJson = formData.get("rawJson");

    console.log('Form data received:', {
      filename: typeof filename === 'string' ? filename : 'missing',
      rawJsonLength: typeof rawJson === 'string' ? rawJson.length : 'missing'
    });

    const errors: CreateFromFileError = {};

    if (!filename) errors.filename = true;
    if (!rawJson) errors.rawJson = true;

    if (Object.keys(errors).length) {
      console.log('Validation errors:', errors);
      return errors;
    }

    invariant(typeof filename === "string", "filename must be a string");
    invariant(typeof rawJson === "string", "rawJson must be a string");

    console.log('Creating document from file upload');
    const doc = await createFromRawJson(filename, rawJson);
    console.log('Document created successfully:', doc.id);

    const url = new URL(request.url);

    context.waitUntil(
      sendEvent({
        type: "create",
        from: "file",
        id: doc.id,
        source: url.searchParams.get("utm_source") ?? url.hostname,
      })
    );

    return redirect(`/j/${doc.id}`);
  } catch (e) {
    console.error('Error in file upload action:', e);
    throw e; // Re-throw to let Remix handle the error response
  }
};

export const loader: LoaderFunction = async () => {
  // Redirect GET requests to the home page
  return redirect("/");
};
