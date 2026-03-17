import { SelectContent, SelectContentProps } from "@radix-ui/react-select";
import { cn } from "@/lib/utils"; // or your classnames utility

const NoAnimationSelectContent = ({ className, ...props }: SelectContentProps) => {
  return (
    <SelectContent
      className={cn(
        "bg-white z-50 rounded-md border shadow-md",
        className
      )}
      {...props}
    />
  );
};

export default NoAnimationSelectContent;
