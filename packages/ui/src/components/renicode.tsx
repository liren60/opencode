import { createUniqueId, type ComponentProps } from "solid-js"

export const RENICODE = import.meta.env?.VITE_RENICODE === "1"

export const APP_NAME = RENICODE ? "Renicode" : "OpenCode"

export function RenicodeMark(props: Pick<ComponentProps<"svg">, "ref" | "class">) {
  const gradient = createUniqueId()

  return (
    <svg
      ref={props.ref}
      class={props.class}
      data-component="logo-mark"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradient} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stop-color="#B89AFF" />
          <stop offset="0.48" stop-color="#8B6CFF" />
          <stop offset="1" stop-color="#4DAAFF" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="62" height="62" rx="18" fill={`url(#${gradient})`} />
      <rect x="1.5" y="1.5" width="61" height="61" rx="17.5" stroke="white" stroke-opacity="0.22" />
      <path
        d="M21 46V18H34C40 18 43 21 43 26C43 31 40 34 34 34H21M33 34L44 46"
        stroke="white"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

export function RenicodeLogo(props: { class?: string }) {
  return (
    <svg class={props.class} viewBox="0 0 288 80" fill="none" aria-hidden="true" direction="ltr">
      <svg x="0" y="8" width="64" height="64" viewBox="0 0 64 64">
        <RenicodeMark />
      </svg>
      <text
        x="84"
        y="58"
        fill="currentColor"
        font-family="Inter, sans-serif"
        font-size="52"
        font-weight="600"
        letter-spacing="-2.5"
      >
        Renicode
      </text>
    </svg>
  )
}
