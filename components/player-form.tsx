"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { Player } from "@/lib/types"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface PlayerFormProps {
  player?: Player
  onSave: (player: Player) => void
  onCancel: () => void
  showRequiredFields?: boolean
  gameType: "8-Ball" | "9-Ball" | "Double-Jeopardy"
}

const playerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  skillLevel8Ball: z.coerce
    .number()
    .min(2, "8-Ball skill level must be at least 2")
    .max(7, "8-Ball skill level cannot exceed 7")
    .optional(),
  skillLevel9Ball: z.coerce
    .number()
    .min(1, "9-Ball skill level must be at least 1")
    .max(9, "9-Ball skill level cannot exceed 9")
    .optional(),
  required8Ball: z.boolean().default(false),
  required9Ball: z.boolean().default(false),
  absent: z.boolean().default(false),
})

type PlayerFormValues = z.infer<typeof playerSchema>

export default function PlayerForm({
  player,
  onSave,
  onCancel,
  showRequiredFields = false,
  gameType,
}: PlayerFormProps) {
  const defaultValues: PlayerFormValues = player
    ? {
        name: player.name,
        skillLevel8Ball: player.skillLevel8Ball,
        skillLevel9Ball: player.skillLevel9Ball,
        required8Ball: player.required8Ball,
        required9Ball: player.required9Ball,
        absent: player.absent,
      }
    : {
        name: "",
        skillLevel8Ball: undefined,
        skillLevel9Ball: undefined,
        required8Ball: false,
        required9Ball: false,
        absent: false,
      }

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues,
  })

  const handleSubmit = (values: PlayerFormValues) => {
    onSave({
      id: player?.id || Date.now().toString(),
      ...values,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Player name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="skillLevel8Ball"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {gameType === "9-Ball" ? "(Optional) " : ""}
                  8-Ball Skill Level (2-7)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={2}
                    max={7}
                    placeholder="Enter skill level"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription className="text-xs">Player's 8-Ball skill level between 2 and 7</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skillLevel9Ball"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {gameType === "8-Ball" ? "(Optional) " : ""}
                  9-Ball Skill Level (1-9)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={9}
                    placeholder="Enter skill level"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription className="text-xs">Player's 9-Ball skill level between 1 and 9</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showRequiredFields && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(gameType === "8-Ball" || gameType === "Double-Jeopardy") && (
              <FormField
                control={form.control}
                name="required8Ball"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{gameType === "8-Ball" ? "Required Player" : "Required for 8-Ball"}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {(gameType === "9-Ball" || gameType === "Double-Jeopardy") && (
              <FormField
                control={form.control}
                name="required9Ball"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{gameType === "9-Ball" ? "Required Player" : "Required for 9-Ball"}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="absent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Absent</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{player ? "Update" : "Add"} Player</Button>
        </div>
      </form>
    </Form>
  )
}
