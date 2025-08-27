import { TemplateIcon, CodeIcon, DownloadIcon, PlusIcon, TrashIcon } from "@heroicons/react/outline";
import { TreeIcon } from "~/components/Icons/TreeIcon";
import { useHotkeys } from "react-hotkeys-hook";
import { Link, useLocation, useNavigate, Form } from "remix";
import { useJsonDoc } from "~/hooks/useJsonDoc";
import { ToolTip } from "./ToolTip";
import { Body } from "./Primitives/Body";
import { ShortcutIcon } from "./Icons/ShortcutIcon";
import { useTheme } from "./ThemeProvider";
import { NewDocument } from "./NewDocument";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "./UI/Popover";

export function SideBar() {
  const { doc } = useJsonDoc();

  return (
    <div className="side-bar flex flex-col align-center justify-between h-full p-1 bg-gray-50 border-r border-gray-200">
      <ol className="relative">
        <SidebarLink to={`/j/${doc.id}`} hotKey="option+1,alt+1">
          <ToolTip arrow="left">
            <Body>Column view</Body>
            <ShortcutIcon className="w-[26px] h-[26px] ml-1 text-gray-700 bg-gray-100">
              ⌥
            </ShortcutIcon>
            <ShortcutIcon className="w-[26px] h-[26px] ml-1 text-gray-700 bg-gray-100">
              1
            </ShortcutIcon>
          </ToolTip>
          <TemplateIcon className="p-2 w-full h-full" />
        </SidebarLink>
        <SidebarLink to={`/j/${doc.id}/editor`} hotKey="option+2,alt+2">
          <ToolTip arrow="left">
            <Body>JSON view</Body>
            <ShortcutIcon className="w-[26px] h-[26px] ml-1 text-gray-700 bg-gray-100">
              ⌥
            </ShortcutIcon>
            <ShortcutIcon className="w-[26px] h-[26px] ml-1 text-gray-700 bg-gray-100">
              2
            </ShortcutIcon>
          </ToolTip>
          <CodeIcon className="p-2 w-full h-full" />
        </SidebarLink>
        <SidebarLink to={`/j/${doc.id}/tree`} hotKey="option+3,alt+3">
          <ToolTip arrow="left">
            <Body>Tree view</Body>
            <ShortcutIcon className="w-[26px] h-[26px] ml-1 text-gray-700 bg-gray-100">
              ⌥
            </ShortcutIcon>
            <ShortcutIcon className="w-[26px] h-[26px] ml-1 text-gray-700 bg-gray-100">
              3
            </ShortcutIcon>
          </ToolTip>
          <TreeIcon className="p-2 w-full h-full" />
        </SidebarLink>
      </ol>
      <ol>
        <SidebarLink>
          <Popover>
            <PopoverTrigger>
              <div>
                <ToolTip arrow="left">
                  <Body>New document</Body>
                </ToolTip>
                <PlusIcon className="p-2 w-full h-full" />
              </div>
            </PopoverTrigger>
            <PopoverContent side="right" sideOffset={8}>
              <NewDocument />
              <PopoverArrow
                className="fill-current text-white"
                offset={20}
              />
            </PopoverContent>
          </Popover>
        </SidebarLink>
        
        {!doc.readOnly && (
          <SidebarLink>
            <Form
              method="delete"
              onSubmit={(e) =>
                !confirm(
                  "Are you sure you want to delete this document? This action cannot be undone."
                ) && e.preventDefault()
              }
            >
              <button type="submit" className="w-full h-full">
                <ToolTip arrow="left">
                  <Body>Delete document</Body>
                </ToolTip>
                <TrashIcon className="p-2 w-full h-full" />
              </button>
            </Form>
          </SidebarLink>
        )}
        
        <SidebarLink>
          <a href={`/j/${doc.id}.json`} target="_blank">
            <ToolTip arrow="left">
              <Body>Download JSON</Body>
            </ToolTip>
            <DownloadIcon className="p-2 w-full h-full" />
          </a>
        </SidebarLink>
      </ol>
    </div>
  );
}

function SidebarLink({
  children,
  to,
  hotKey,
}: {
  children: React.ReactNode;
  to?: string;
  hotKey?: string;
}) {
  const location = useLocation();

  const isActive = location.pathname === to;

  const { minimal } = useJsonDoc();
  const [theme] = useTheme();

  const queryParams = new URLSearchParams();

  if (typeof minimal === "boolean") {
    queryParams.set("minimal", String(minimal));

    if (theme) {
      queryParams.set("theme", theme);
    }
  }

  const href = `${to}${queryParams.toString().length > 0 ? `?${queryParams.toString()}` : ""
    }`;

  if (hotKey) {
    const navigate = useNavigate();
    useHotkeys(
      hotKey,
      (e) => {
        e.preventDefault();
        if (!isActive && to) {
          navigate(href);
        }
      },
      [navigate, isActive, to]
    );
  }

  const classes = isActive
    ? "relative w-10 h-10 mb-1 text-white bg-blue-600 rounded-lg cursor:pointer transition"
    : "relative w-10 h-10 mb-1 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-lg cursor:pointer transition";

  return !!to ? (
    <Link to={href} prefetch={isActive ? "none" : "render"}>
      <li className={classes}>{children}</li>
    </Link>
  ) : (
    <li className={classes}>{children}</li>
  );
}
