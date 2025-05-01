"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ReportErrorButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="flex justify-center mt-8 mb-4">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Report an Error</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Message from DEADTOOL</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center text-lg font-bold py-4">Quit being a whiny bitch</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  )
}
