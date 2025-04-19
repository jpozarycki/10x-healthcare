"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Check, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"

export type Option = {
  label: string
  value: string
}

type BaseInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange" | "ref">

interface MultiSelectProps extends BaseInputProps {
  options: Option[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export const MultiSelect = React.forwardRef<HTMLInputElement, MultiSelectProps>(({
  options,
  value = [],
  onChange,
  placeholder = "Select items...",
  disabled = false,
  ...props
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(value)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current && 
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("click", handleClickOutside, true)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside, true)
    }
  }, [open])

  useEffect(() => {
    setSelected(value)
  }, [value])

  const handleSelect = useCallback(
    (option: Option) => {
      const newSelected = selected.includes(option.value)
        ? selected.filter((item) => item !== option.value)
        : [...selected, option.value]
      setSelected(newSelected)
      onChange?.(newSelected)
      setInputValue("")
      inputRef.current?.focus()
    },
    [onChange, selected]
  )

  const handleRemove = useCallback(
    (selectedItem: string) => {
      const newSelected = selected.filter((item) => item !== selectedItem)
      setSelected(newSelected)
      onChange?.(newSelected)
    },
    [onChange, selected]
  )

  const handleCommandSelect = useCallback(
    (value: string, option: Option) => {
      handleSelect(option)
    },
    [handleSelect]
  )

  return (
    <div ref={wrapperRef}>
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
          if (e.key === "Enter") {
            e.preventDefault()
          }
          if (e.key === "Escape") {
            setOpen(false)
          }
        }}
        shouldFilter={inputValue.length > 0}
      >
        <div 
          className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          onClick={() => {
            setOpen(true)
            inputRef.current?.focus()
          }}
        >
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
                      type="button"
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
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemove(selectedValue)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              )
            })}
            <CommandPrimitive.Input
              ref={(node) => {
                inputRef.current = node
                if (typeof ref === 'function') ref(node)
                else if (ref) ref.current = node
              }}
              disabled={disabled}
              value={inputValue}
              onValueChange={setInputValue}
              onFocus={() => setOpen(true)}
              placeholder={selected.length === 0 ? placeholder : undefined}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
              {...props}
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full max-h-60 overflow-auto">
                {options.map((option) => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(value) => handleCommandSelect(value, option)}
                      className="cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault()
                      }}
                    >
                      <div
                        className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
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
    </div>
  )
}) 