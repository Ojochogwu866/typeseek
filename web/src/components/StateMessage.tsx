import type { ReactNode } from "react";

interface StateMessageProps {
  children: ReactNode;
  variant?: "bordered" | "inline";
  tone?: "muted" | "error";
}

export function StateMessage({ children, variant = "inline", tone = "muted" }: StateMessageProps) {
  const classes = [
    "state-message",
    variant === "bordered" ? "state-message--bordered" : "state-message--inline",
    tone === "error" ? "state-message--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
