import { customRandom } from "nanoid";
import safeFetch from "./utilities/safeFetch";
import createFromRawXml from "./utilities/xml/createFromRawXml";
import isXML from "./utilities/xml/isXML";

type BaseJsonDocument = {
  id: string;
  title: string;
  readOnly: boolean;
};

export type RawJsonDocument = BaseJsonDocument & {
  type: "raw";
  contents: string;
};

export type UrlJsonDocument = BaseJsonDocument & {
  type: "url";
  url: string;
};

export type CreateJsonOptions = {
  ttl?: number;
  readOnly?: boolean;
  injest?: boolean;
  metadata?: any;
};

export type JSONDocument = RawJsonDocument | UrlJsonDocument;

export async function createFromUrlOrRawJson(
  urlOrJson: string,
  title?: string
): Promise<JSONDocument | undefined> {
  console.log('Processing input, length:', urlOrJson.length, 'title:', title);
  
  // Check size limit - being generous with 18GB RAM available
  const MAX_CONTENT_SIZE = (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') 
    ? 500 * 1024 * 1024  // 500MB for development
    : 1024 * 1024 * 1024; // 1GB for production
  
  if (urlOrJson.length > MAX_CONTENT_SIZE) {
    const sizeMB = Math.round(MAX_CONTENT_SIZE / 1024 / 1024);
    const errorMsg = `Content too large. Maximum size is ${sizeMB}MB. Your content is ${Math.round(urlOrJson.length / 1024 / 1024 * 10) / 10}MB`;
    console.error('Size limit exceeded:', errorMsg);
    throw new Error(errorMsg);
  }

  if (isUrl(urlOrJson)) {
    console.log('Creating from URL');
    return createFromUrl(new URL(urlOrJson), title);
  }

  if (isJSON(urlOrJson)) {
    console.log('Creating from JSON');
    return createFromRawJson(title || "Untitled", urlOrJson);
  }

  // Wrapper for createFromRawJson to handle XML
  // TODO ? change from urlOrJson to urlOrJsonOrXml
  if (isXML(urlOrJson)) {
    console.log('Creating from XML');
    return createFromRawXml(title || "Untitled", urlOrJson);
  }

  // If it's neither URL, JSON, nor XML, throw a descriptive error
  const errorMsg = "Input must be a valid URL, JSON, or XML content";
  console.error('No valid format detected for input of length:', urlOrJson.length);
  throw new Error(errorMsg);
}

export async function createFromUrl(
  url: URL,
  title?: string,
  options?: CreateJsonOptions
): Promise<JSONDocument> {
  if (options?.injest) {
    const response = await safeFetch(url.href);

    if (!response.ok) {
      throw new Error(`Failed to injest ${url.href}`);
    }

    return createFromRawJson(title || url.href, await response.text(), options);
  }

  const docId = createId();

  const doc: JSONDocument = {
    id: docId,
    type: <const>"url",
    url: url.href,
    title: title ?? url.hostname,
    readOnly: options?.readOnly ?? false,
  };

  await DOCUMENTS.put(docId, JSON.stringify(doc), {
    expirationTtl: options?.ttl ?? undefined,
    metadata: options?.metadata ?? undefined,
  });

  return doc;
}

export async function createFromRawJson(
  filename: string,
  contents: string,
  options?: CreateJsonOptions
): Promise<JSONDocument> {
  console.log("Creating raw JSON document:", {
    filename,
    contentLength: contents.length,
    options
  });

  // Validate JSON first
  try {
    JSON.parse(contents);
  } catch (e) {
    console.error("JSON parsing failed:", e);
    throw new Error("Invalid JSON format");
  }

  const docId = createId();
  const doc: JSONDocument = {
    id: docId,
    type: <const>"raw",
    contents,
    title: filename,
    readOnly: options?.readOnly ?? false,
  };

  console.log("Attempting to store document:", {
    id: docId,
    docSize: JSON.stringify(doc).length
  });

  try {
    await DOCUMENTS.put(docId, JSON.stringify(doc), {
      expirationTtl: options?.ttl ?? undefined,
      metadata: options?.metadata ?? undefined,
    });
    console.log("Document stored successfully:", docId);
  } catch (e) {
    console.error("Failed to store document:", e);
    throw new Error("Failed to store document: " + (e instanceof Error ? e.message : "Unknown error"));
  }

  return doc;
}

export async function getDocument(
  slug: string
): Promise<JSONDocument | undefined> {
  try {
    console.log('Getting document from KV:', slug);
    const doc = await DOCUMENTS.get(slug);

    if (!doc) {
      console.log('Document not found in KV:', slug);
      return;
    }

    console.log('Document retrieved from KV, size:', doc.length);
    const parsed = JSON.parse(doc);
    console.log('Document parsed successfully');
    return parsed;
  } catch (e) {
    console.error('Error getting document from KV:', e);
    throw new Error('Failed to retrieve document: ' + (e instanceof Error ? e.message : 'Unknown error'));
  }
}

export async function updateDocument(
  slug: string,
  title: string
): Promise<JSONDocument | undefined> {
  const document = await getDocument(slug);

  if (!document) return;

  const updated = { ...document, title };

  await DOCUMENTS.put(slug, JSON.stringify(updated));

  return updated;
}

export async function deleteDocument(slug: string): Promise<void> {
  await DOCUMENTS.delete(slug);
}

function createId(): string {
  const nanoid = customRandom(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    12,
    (bytes: number): Uint8Array => {
      const array = new Uint8Array(bytes);
      crypto.getRandomValues(array);
      return array;
    }
  );
  return nanoid();
}

function isUrl(possibleUrl: string): boolean {
  try {
    new URL(possibleUrl);
    return true;
  } catch {
    return false;
  }
}

function isJSON(possibleJson: string): boolean {
  try {
    JSON.parse(possibleJson);
    return true;
  } catch (e) {
    // Log parsing errors for debugging but keep it concise
    const error = e instanceof Error ? e : new Error(String(e));
    if (possibleJson.length > 1000) {
      console.log('JSON parse failed for large content (length:', possibleJson.length, '):', error.message);
    }
    return false;
  }
}
