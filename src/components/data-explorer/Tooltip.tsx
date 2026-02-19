import {
  Tooltip as ShadTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Tooltip = ({
  children,
  content,
  disabled = false,
  side = "top",
  contentClassName = "",
}: {
  children: React.ReactNode;
  content: React.ReactNode | string;
  disabled?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  contentClassName?: string;
}) => {
  if (disabled) return <>{children}</>;
  return (
    <ShadTooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        className={`bg-white z-[10000] ${contentClassName}`}
        side={side}
      >
        <p>{content}</p>
      </TooltipContent>
    </ShadTooltip>
  );
};
