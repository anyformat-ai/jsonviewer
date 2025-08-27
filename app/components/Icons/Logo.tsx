import { Link } from "remix";
import logoAnyformat from "~/assets/images/logo-anyformat.png";

export function Logo({
  className,
  width = "auto",
}: {
  className?: string;
  width?: string;
}) {
  return (
    <Link to="/" aria-label="Anyformat homepage" className="block">
      <img
        src={logoAnyformat}
        alt="Anyformat"
        className={`h-8 w-auto ${className || ''}`}
        style={{ width }}
      />
    </Link>
  );
}
