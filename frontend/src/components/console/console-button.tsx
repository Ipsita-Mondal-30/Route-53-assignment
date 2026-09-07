import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "normal" | "primary" | "orange" | "secondary" | "link";

type Common = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonProps = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkProps = Common & {
  href: string;
};

function classes(variant: Variant, className?: string) {
  const variantClass =
    variant === "primary"
      ? "console-btn-primary"
      : variant === "orange"
        ? "console-btn-orange"
        : variant === "secondary"
          ? "console-btn-secondary"
          : variant === "link"
            ? "console-btn-link"
            : "console-btn-normal";
  return `console-btn ${variantClass} ${className ?? ""}`;
}

export function ConsoleButton(props: ButtonProps | LinkProps) {
  const variant = props.variant ?? "normal";
  if ("href" in props && props.href) {
    const { href, children, className } = props;
    return (
      <Link href={href} className={classes(variant, className)}>
        {children}
      </Link>
    );
  }

  const { children, className, type = "button", ...rest } = props as ButtonProps;
  return (
    <button type={type} className={classes(variant, className)} {...rest}>
      {children}
    </button>
  );
}
