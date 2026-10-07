import type { SVGProps } from "react";

/** A small inline icon set (24px grid, stroke icons) so Spotlight needs no icon library. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function make(paths: React.ReactNode, displayName: string) {
  function Icon({ size = 20, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {paths}
      </svg>
    );
  }
  Icon.displayName = displayName;
  return Icon;
}

export const MenuIcon = make(<path d="M4 6h16M4 12h16M4 18h16" />, "MenuIcon");
export const CloseIcon = make(<path d="M6 6l12 12M18 6L6 18" />, "CloseIcon");
export const ChevronLeft = make(<path d="M15 18l-6-6 6-6" />, "ChevronLeft");
export const ChevronRight = make(<path d="M9 18l6-6-6-6" />, "ChevronRight");
export const ChevronDown = make(<path d="M6 9l6 6 6-6" />, "ChevronDown");
export const SearchIcon = make(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>, "SearchIcon");
export const ArrowUp = make(<path d="M12 19V5M5 12l7-7 7 7" />, "ArrowUp");
export const ArrowDown = make(<path d="M12 5v14M19 12l-7 7-7-7" />, "ArrowDown");
export const TrendUp = make(<path d="M4 17l6-6 4 4 6-6M14 9h6v6" />, "TrendUp");
export const TrendDown = make(<path d="M4 7l6 6 4-4 6 6M14 15h6V9" />, "TrendDown");
export const InfoIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, "InfoIcon");
export const ChartIcon = make(<><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>, "ChartIcon");
export const SchoolIcon = make(<><path d="M3 21h18M5 21V10l7-5 7 5v11" /><path d="M10 21v-5h4v5M12 5V2l3 1.5" /></>, "SchoolIcon");
export const TeamIcon = make(<><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c2.8 0 5 2.2 5 5" /></>, "TeamIcon");
export const TeacherIcon = make(<><circle cx="8" cy="6" r="3" /><path d="M3 21v-5a5 5 0 0110 0v5M14 4h7v8h-7M16 12l-2 4" /></>, "TeacherIcon");
export const ArmsIcon = make(<><rect x="3" y="4" width="18" height="6" rx="1" /><path d="M5 14h2M11 14h2M17 14h2M5 18h2M11 18h2M17 18h2" /></>, "ArmsIcon");
export const PupilsIcon = make(<><circle cx="8" cy="5" r="2" /><circle cx="16" cy="5" r="2" /><path d="M6 21v-6H5l1-6h4l1 6h-1v6M14 21v-6h-1l1-6h4l1 6h-1v6" /></>, "PupilsIcon");
export const RatioIcon = make(<><circle cx="6" cy="6" r="1.5" /><circle cx="12" cy="9" r="1.5" /><circle cx="18" cy="6" r="1.5" /><circle cx="9" cy="15" r="1.5" /><circle cx="15" cy="15" r="1.5" /><circle cx="12" cy="20" r="1.5" /></>, "RatioIcon");
export const PersonIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>, "PersonIcon");
export const MapPinIcon = make(<><path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>, "MapPinIcon");
export const LogoutIcon = make(<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11" />, "LogoutIcon");
export const RefreshIcon = make(<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" />, "RefreshIcon");
export const OfflineIcon = make(<path d="M2 8.8a15 15 0 0120 0M5.5 12.4a10 10 0 0113 0M9 16a5 5 0 016 0M12 20h.01M3 3l18 18" />, "OfflineIcon");
export const CopyIcon = make(<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" /></>, "CopyIcon");
