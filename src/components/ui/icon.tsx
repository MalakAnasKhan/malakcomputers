import type { SVGProps } from "react";

type IconName = "arrow" | "arrow-up" | "search" | "menu" | "close" | "chat" | "filter" | "box" | "check" | "plus";
const paths: Record<IconName, string> = {
  arrow: "M4 12h16m-6-6 6 6-6 6", "arrow-up": "M6 18 18 6M6 6h12v12",
  search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  menu: "M3 6h18M3 12h18M3 18h18", close: "m5 5 14 14M5 19 19 5",
  chat: "M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z",
  filter: "M4 6h16M7 12h10M10 18h4", box: "m3 7 9-5 9 5v10l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v10",
  check: "m5 12 4 4L19 6", plus: "M12 5v14M5 12h14",
};
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>;
}
