import { Link } from "remix";

export function ExampleDoc({
  id,
  title,
  path,
}: {
  id: string;
  title: string;
  path?: string;
}) {
  return (
    <Link
      to={`/j/${id}${path ? `?path=${path}` : ""}`}
      className="bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg whitespace-nowrap text-blue-700 hover:text-blue-800 font-inter font-medium transition-colors"
    >
      {title}
    </Link>
  );
}
