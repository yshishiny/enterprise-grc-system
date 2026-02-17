import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Avatar>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Avatar> & {
    size?: "default" | "sm" | "lg"
  }
>(({ className, size = "default", ...props }, ref) => (
  <AvatarPrimitive.Avatar
    ref={ref}
    className={cn(
      "relative flex shrink-0 overflow-hidden rounded-full",
      size === "sm" && "h-8 w-8",
      size === "default" && "h-10 w-10",
      size === "lg" && "h-14 w-14",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.AvatarImage>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.AvatarImage>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.AvatarImage
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.AvatarFallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.AvatarFallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.AvatarFallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
