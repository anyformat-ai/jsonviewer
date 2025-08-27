import { PlusIcon, TrashIcon } from "@heroicons/react/outline";
import { DocumentTitle } from "./DocumentTitle";
import { Logo } from "./Icons/Logo";
import { NewDocument } from "./NewDocument";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "./UI/Popover";
import { Form } from "remix";
import { useJsonDoc } from "~/hooks/useJsonDoc";

export function Header() {
  const { doc } = useJsonDoc();

  return (
    <header className="flex items-center justify-between w-screen h-[50px] bg-white border-b border-gray-200">
      <div className="flex pl-4 gap-2 h-8 justify-center items-center">
        <div className="w-24 sm:w-28">
          <Logo />
        </div>
      </div>
      <DocumentTitle />
      <div className="flex text-sm items-center gap-3 px-4">
        <Popover>
          <PopoverTrigger>
            <button className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white font-medium font-inter rounded-lg hover:bg-blue-700 transition-colors">
              <PlusIcon className="w-4 h-4 mr-2"></PlusIcon>
              New
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" sideOffset={8}>
            <NewDocument />
            <PopoverArrow
              className="fill-current text-white"
              offset={20}
            />
          </PopoverContent>
        </Popover>

        {!doc.readOnly && (
          <Form
            method="delete"
            onSubmit={(e) =>
              !confirm(
                "Are you sure you want to delete this document? This action cannot be undone."
              ) && e.preventDefault()
            }
          >
            <button 
              type="submit"
              className="flex items-center justify-center py-2 px-4 bg-red-600 text-white font-medium font-inter rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="w-4 h-4 mr-2"></TrashIcon>
              Delete
            </button>
          </Form>
        )}
      </div>
    </header>
  );
}
