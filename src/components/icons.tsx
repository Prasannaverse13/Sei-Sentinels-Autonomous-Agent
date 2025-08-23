import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
    >
      <path fill="hsl(var(--primary))" d="M0 0h256v256H0z" />
      <path
        fill="hsl(var(--primary-foreground))"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z"
      />
      <path
        fill="hsl(var(--accent))"
        d="M168 88h-56a48 48 0 0 0-48 48v48a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16v-32h12a16 16 0 0 0 16-16V96a8 8 0 0 0-8-8Zm-44 96H84v-48a32 32 0 0 1 32-32h12v72a8 8 0 0 1-8 8Z"
      />
    </svg>
  );
}
