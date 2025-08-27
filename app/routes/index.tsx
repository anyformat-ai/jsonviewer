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
import { UrlForm } from "~/components/UrlForm";
import { SampleUrls } from "~/components/SampleUrls";
import { Title } from "~/components/Primitives/Title";

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
    <div className="min-h-screen bg-white flex flex-col">
      {toastMessage && (
        <ToastPopover
          message={toastMessage.message}
          title={toastMessage.title}
          type={toastMessage.type}
          key={toastMessage.id}
        />
      )}

      {/* Header */}
      <div className="flex justify-center pt-12 pb-8">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-8">
        <div className="max-w-4xl w-full text-center">
          <ExtraLargeTitle className="text-gray-900 mb-4 font-inter font-bold">
            Professional JSON Viewer
          </ExtraLargeTitle>
          <ExtraLargeTitle className="text-gray-700 mb-6 font-inter font-medium">
            Beautiful interface for developers & data teams
          </ExtraLargeTitle>
          <SmallSubtitle className="text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Explore JSON data with our intuitive column view, powerful search capabilities, 
            and intelligent content previews. Perfect for APIs, configurations, and data analysis.
          </SmallSubtitle>

          {/* Large Drop Zone Section */}
          <div className="space-y-10">
            {/* URL Input */}
            <div className="mb-8">
              <UrlForm />
            </div>

            {/* Large Drag and Drop Area */}
            <div className="mx-auto max-w-2xl">
              <DragAndDropForm />
            </div>

            {/* Sample URLs */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <Title className="mb-6 text-gray-700 font-inter font-medium">Try with sample data:</Title>
              <SampleUrls />
            </div>
          </div>
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
