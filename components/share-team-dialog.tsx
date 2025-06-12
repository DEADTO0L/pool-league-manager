"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Share, Copy, Check } from "lucide-react"
import { shareTeam } from "@/lib/share-utils"
import type { Team } from "@/lib/types"

interface ShareTeamDialogProps {
  team: Team
}

export default function ShareTeamDialog({ team }: ShareTeamDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      try {
        // Generate a share URL with the ultra-compact format
        const shareData = shareTeam(team)
        const url = `${window.location.origin}/shared/${shareData}`
        setShareUrl(url)
        setCopied(false)
      } catch (error) {
        console.error("Error generating share URL:", error)
        toast({
          title: "Error",
          description: "Failed to generate share link",
          variant: "destructive",
        })
      }
    }
  }, [isOpen, team, toast])

  const copyToClipboard = async () => {
    try {
      // Try the modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard",
        })
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = shareUrl
        textArea.style.position = "fixed" // Avoid scrolling to bottom
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)

        if (successful) {
          setCopied(true)
          toast({
            title: "Link copied",
            description: "Share link copied to clipboard",
          })
        } else {
          throw new Error("Copy command was unsuccessful")
        }
      }

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()} // Prevent card click from triggering
        >
          <Share className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Share team</DialogTitle>
          <DialogDescription>Share "{team.name}" with others using this link</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                ;(e.target as HTMLInputElement).select()
              }}
            />
            <p className="text-xs text-muted-foreground">
              Anyone with this link will be able to view and import this team
            </p>
          </div>
          <Button
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              copyToClipboard()
            }}
            className="flex-shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
