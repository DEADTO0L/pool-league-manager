import * as React from "react"
import { cn } from "@/lib/utils"

import { CircleAlertIcon as AlertCirclePrimitive } from "lucide-react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full rounded-lg border p-4 alert",
          variant === "destructive" ? "border-destructive text-destructive [&>svg]:text-destructive" : "",
          variant === "warning" ? "border-yellow-500 text-yellow-700 [&>svg]:text-yellow-600" : "",
          variant === "default" ? "border-border" : "",
          className,
        )}
        data-variant={variant}
        role="alert"
        {...props}
      >
        {children}
      </div>
    )
  },
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  },
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("text-sm alert-description", className)} {...props} />
  },
)
AlertDescription.displayName = "AlertDescription"

const AlertCircle = AlertCirclePrimitive

export { Alert, AlertTitle, AlertDescription, AlertCircle }
