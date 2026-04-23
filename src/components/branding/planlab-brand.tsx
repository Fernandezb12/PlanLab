import Image from "next/image";

import { cn } from "@/lib/utils/cn";

type PlanLabBrandProps = {
  kind?: "full" | "icon";
  className?: string;
  priority?: boolean;
};

const iconDimensions = {
  width: 600,
  height: 800
};

const fullDimensions = {
  width: 1440,
  height: 802
};

export const PlanLabBrand = ({ kind = "full", className, priority = false }: PlanLabBrandProps) => {
  if (kind === "icon") {
    return (
      <Image
        src="/branding/planlab-icon.png"
        alt="PlanLab"
        width={iconDimensions.width}
        height={iconDimensions.height}
        priority={priority}
        className={cn("h-auto w-full object-contain", className)}
      />
    );
  }

  return (
    <>
      <Image
        src="/branding/planlab-logo-light.png"
        alt="PlanLab"
        width={fullDimensions.width}
        height={fullDimensions.height}
        priority={priority}
        className={cn("h-auto w-full object-contain dark:hidden", className)}
      />
      <Image
        src="/branding/planlab-logo-dark.png"
        alt="PlanLab"
        width={fullDimensions.width}
        height={fullDimensions.height}
        priority={priority}
        className={cn("hidden h-auto w-full object-contain dark:block", className)}
      />
    </>
  );
};
