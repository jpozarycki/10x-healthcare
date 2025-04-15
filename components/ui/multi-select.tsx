"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"

export type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select items...",
  disabled = false,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<string[]>(value)
  const [inputValue, setInputValue] = React.useState("")

  React.useEffect(() => {
    setSelected(value)
  }, [value])

  const handleSelect = React.useCallback(
    (option: Option) => {
      const newSelected = selected.includes(option.value)
        ? selected.filter((item) => item !== option.value)
        : [...selected, option.value]
      setSelected(newSelected)
      onChange?.(newSelected)
    },
    [onChange, selected]
  )

  const handleRemove = React.useCallback(
    (selectedItem: string) => {
      const newSelected = selected.filter((item) => item !== selectedItem)
      setSelected(newSelected)
      onChange?.(newSelected)
    },
    [onChange, selected]
  )

  return (
    <Command
      className="overflow-visible bg-transparent"
      onKeyDown={(e) => {
        if (e.key === "Backspace" && !inputValue) {
          e.preventDefault()
          const lastSelected = selected[selected.length - 1]
          if (lastSelected) {
            handleRemove(lastSelected)
          }
        }
      }}
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((selectedValue) => {
            const option = options.find((opt) => opt.value === selectedValue)
            if (!option) return null
            return (
              <Badge
                key={selectedValue}
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {option.label}
                {!disabled && (
                  <button
                    className="ml-1 rounded-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRemove(selectedValue)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => handleRemove(selectedValue)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            disabled={disabled}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : undefined}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer"
                  >
                    <div
                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      }`}
                    >
                      <X className="h-3 w-3" />
                    </div>
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  )
} 