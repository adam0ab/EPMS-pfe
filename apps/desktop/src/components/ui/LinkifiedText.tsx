import { Fragment } from "react";

const urlPattern = /(https?:\/\/[^\s]+)/g;

/** Renders URLs stored in procedure text as safe, keyboard-accessible external links. */
export function LinkifiedText({ text }: { text: string }) {
  return <>{text.split(urlPattern).map((part, index) => {
    if (!/^https?:\/\//.test(part)) return <Fragment key={index}>{part}</Fragment>;
    const url = part.replace(/[.,;:!?)]$/, "");
    const trailingPunctuation = part.slice(url.length);
    return <Fragment key={index}>
      <a href={url} target="_blank" rel="noreferrer" className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary focus-ring">
        {url}
      </a>
      {trailingPunctuation}
    </Fragment>;
  })}</>;
}
