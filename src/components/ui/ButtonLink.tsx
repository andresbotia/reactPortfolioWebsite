import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

export function ButtonLink({ variant = "secondary", children, className = "", ...props }: ButtonLinkProps) {
  return (
    <a className={`button-link button-link--${variant} ${className}`} {...props}>
      {children}
    </a>
  );
}
