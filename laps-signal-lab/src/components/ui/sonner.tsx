import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "rounded-2xl border font-sans shadow-[0_4px_20px_rgba(25,58,89,0.12)] text-sm",
          title: "font-semibold",
          description: "text-xs opacity-80",
          success: "bg-emerald-50 border-emerald-200 text-emerald-900",
          error: "bg-red-50 border-red-200 text-red-900",
          warning: "bg-amber-50 border-amber-200 text-amber-900",
          info: "bg-[#E0F0FF] border-[#74B5F2]/50 text-[#193A59]",
          actionButton: "bg-[#0B4E8D] text-white",
          cancelButton: "bg-[#E0F0FF] text-[#193A59]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
