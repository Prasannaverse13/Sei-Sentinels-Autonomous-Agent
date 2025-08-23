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

export function SeiWhale(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6.23,19.34a2.3,2.3,0,0,1-2.07-1.1,3.23,3.23,0,0,1-.16-2.13,9.42,9.42,0,0,1,2.05-4.88,11.47,11.47,0,0,1,4-3.84,11.12,11.12,0,0,1,4.72-1.39,10.6,10.6,0,0,1,5,.8,8,8,0,0,1,3,2.5,5.2,5.2,0,0,1,.87,3.32,5.1,5.1,0,0,1-1.66,3.18,6.82,6.82,0,0,1-4.2,1.87,10.67,10.67,0,0,1-5.46-1.55" />
      <path d="M12.09,11.7,11.83,12c-2.82,1.2-5.9,1.82-8.23,1.9" />
      <path d="M18,10.5a9,9,0,0,1,3.49,3.8" />
      <path d="M9.16,15.25a13.4,13.4,0,0,0,5.43,1.24,6,6,0,0,0,4.2-1.49" />
      <circle cx="15" cy="8.5" r="0.5" fill="currentColor"/>
    </svg>
  );
}
