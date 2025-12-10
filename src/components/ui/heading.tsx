import { cn } from "@/lib/utils";
import React, { JSX } from "react";

type HeadingProps = {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  center?: boolean;
  className?: string;
};

type SubHeading = {
  text: string;
  className?: string;
};

const headingSizeMap: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "text-3xl sm:text-4xl font-extrabold",
  2: "text-2xl sm:text-3xl font-bold",
  3: "text-xl sm:text-2xl font-semibold",
  4: "text-lg sm:text-xl font-semibold",
  5: "text-base sm:text-lg font-medium",
  6: "text-base sm:text-lg font-medium",
};

const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  center = false,
  className = "",
}) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  const headingClasses = headingSizeMap[level] || headingSizeMap[1];

  return (
    <HeadingTag
      className={`${headingClasses} ${
        center ? "text-center" : "text-left"
      } ${cn("text-gray-900 block", className)}`}
    >
      {children}
    </HeadingTag>
  );
};

const Subtitle: React.FC<SubHeading> = ({ text, className = "" }) => (
  <p className={`mt-1 text-gray-600 text-sm ${className}`}>{text}</p>
);

export { Heading, Subtitle };
