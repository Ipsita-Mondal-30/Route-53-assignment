import { ChevronDownIcon, GlobeIcon, UserCircleIcon } from "@/components/ui/icons";

const links = [
  { label: "Contact us", href: "#" },
  { label: "AWS Marketplace", href: "#" },
  { label: "Support", href: "#", hasMenu: true },
  { label: "My account", href: "#", hasMenu: true },
] as const;

export function AwsTopBar() {
  return (
    <div className="bg-aws-navy text-white">
      <div className="mx-auto flex h-[58px] max-w-[1600px] items-center justify-end gap-5 px-5 text-[13px] md:gap-6 md:px-8">
        <a
          href="#"
          className="aws-focus inline-flex items-center gap-1.5 whitespace-nowrap hover:underline"
        >
          <GlobeIcon className="h-4 w-4" />
          English
          <ChevronDownIcon className="h-2.5 w-2.5" />
        </a>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="aws-focus hidden items-center gap-1 whitespace-nowrap hover:underline sm:inline-flex"
          >
            {link.label}
            {"hasMenu" in link && link.hasMenu ? (
              <ChevronDownIcon className="h-2.5 w-2.5" />
            ) : null}
          </a>
        ))}
        <a href="#" className="aws-focus rounded-full" aria-label="Account">
          <UserCircleIcon className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}
