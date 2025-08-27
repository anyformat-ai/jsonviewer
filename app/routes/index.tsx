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
    <div className="min-h-screen bg-[rgb(56,52,139)] flex flex-col">
      {toastMessage && (
        <ToastPopover
          message={toastMessage.message}
          title={toastMessage.title}
          type={toastMessage.type}
          key={toastMessage.id}
        />
      )}

      {/* Header */}
      <div className="flex justify-center p-8">
        <Logo />
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-8">
        <div className="max-w-4xl w-full text-center">
          <ExtraLargeTitle className="text-lime-300 mb-4">
            JSON Hero
          </ExtraLargeTitle>
          <ExtraLargeTitle className="text-white mb-6">
            A beautiful JSON viewer for the web
          </ExtraLargeTitle>
          <SmallSubtitle className="text-slate-200 mb-12 max-w-2xl mx-auto">
            Stop staring at thousand line JSON files in your editor and start
            exploring them with our beautiful column view, search, and smart previews.
          </SmallSubtitle>

          {/* Large Drop Zone Section */}
          <div className="space-y-8">
            {/* URL Input */}
            <div className="mb-8">
              <UrlForm />
            </div>

            {/* Large Drag and Drop Area */}
            <div className="mx-auto max-w-2xl">
              <DragAndDropForm />
            </div>

            {/* Sample URLs */}
            <div className="mt-12 pt-8">
              <Title className="mb-4 text-slate-200">No JSON? Try it out:</Title>
              <SampleUrls />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <SmallSubtitle className="text-slate-400">
          Built with ❤️ by{" "}
          <a 
            href="https://trigger.dev" 
            className="text-lime-300 hover:text-lime-200 transition-colors"
          >
            Trigger.dev
          </a>
        </SmallSubtitle>
      </div>
    </div>
  );
}
