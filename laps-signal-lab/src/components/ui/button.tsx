import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Themed to the instrument direction rather than left at the shadcn default.
// Three things changed and each is load-bearing:
//   - Square-ish (2px) instead of rounded-md, matching the panel language.
//   - Borders and fills carry state instead of shadows. The stock variants lean
//     on `shadow`/`shadow-sm`, which on a page built from hairline rules reads
//     as a different design system bolted on.
//   - Real :active and :focus-visible states. The defaults gave hover only, so
//     every button on the portal and admin snapped with no press feedback and
//     showed a ring that matched nothing on the page.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold cursor-pointer transition-[background-color,border-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-laps-signal active:translate-y-px disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-laps-ink text-white hover:bg-laps-accent",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-laps-navy/25 bg-transparent text-laps-navy hover:border-laps-navy hover:bg-laps-navy hover:text-white",
        secondary: "bg-laps-ghost text-laps-navy hover:bg-laps-navy/10",
        ghost: "text-laps-navy hover:bg-laps-ghost",
        link: "text-laps-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
