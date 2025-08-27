import {
  commitSession,
  getSession,
  ToastMessage,
} from "../services/toast.server";
import { json, useLoaderData } from "remix";
import ToastPopover from "../components/UI/ToastPopover";
import { Logo } from "~/components/Icons/Logo";
import { ExtraLargeTitle } from "~/components/Primitives/ExtraLargeTitle";
import { SmallSubtitle } from "~/components/Primitives/SmallSubtitle";
import { DragAndDropForm } from "~/components/DragAndDropForm";
import { JsonInputForm } from "~/components/JsonInputForm";
import { Title } from "~/components/Primitives/Title";
import { FileInspector } from "~/components/FileInspector";

type LoaderData = { toastMessage?: ToastMessage };

export async function loader({ request }: { request: Request }) {
  const cookie = request.headers.get("cookie");
  const session = await getSession(cookie);
  const toastMessage = session.get("toastMessage") as ToastMessage;

  return json(
    { toastMessage },
    {
      headers: { "Set-Cookie": await commitSession(session) },
    }
  );
}
export default function Index() {
  const { toastMessage } = useLoaderData<LoaderData>();

  return (
          <div className="min-h-screen bg-white">
        {toastMessage && (
          <ToastPopover
            message={toastMessage.message}
            title={toastMessage.title}
            type={toastMessage.type}
            key={toastMessage.id}
          />
        )}

        {/* Header */}
        <div className="flex justify-center pt-8 pb-8">
          <Logo />
        </div>

        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto px-6">
          {/* Drop Zone Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <ExtraLargeTitle className="text-gray-900 mb-2 font-inter font-bold">
                JSON Viewer
              </ExtraLargeTitle>
              <SmallSubtitle className="text-gray-600 font-inter">
                Drop a file, paste JSON, or enter a URL to get started
              </SmallSubtitle>
            </div>

            {/* Upload Options */}
            <div className="space-y-8">
              {/* Large Drag and Drop Area */}
              <DragAndDropForm />

              {/* Enhanced JSON Input Form */}
              <JsonInputForm />
            </div>
          </div>

          {/* File Inspector Table */}
          <div className="mb-12">
            <FileInspector />
          </div>
        </div>

        {/* Footer */}
      <div className="text-center py-12 border-t border-gray-100">
        <SmallSubtitle className="text-gray-500 font-inter">
          Powered by{" "}
          <a 
            href="https://anyformat.app" 
            className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            Anyformat
          </a>
        </SmallSubtitle>
      </div>
    </div>
  );
}
