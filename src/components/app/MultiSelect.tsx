import { useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  id,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  const allOptions = [...options, ...value.filter((v) => !options.includes(v))];
  const q = query.trim().replace(/\s+/g, " ").slice(0, 60);
  const exists = allOptions.some((o) => o.toLowerCase() === q.toLowerCase());
  const addCustom = () => {
    if (!q || exists) return;
    onChange([...value, q]);
    setQuery("");
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-left text-sm text-muted-foreground shadow-sm hover:border-teal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {value.length ? `${value.length} selected` : placeholder}
            <ChevronsUpDown className="size-4 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search or type to add..." value={query} onValueChange={setQuery} maxLength={60} />
            <CommandList>
              {!q && <CommandEmpty>No match.</CommandEmpty>}
              {q && !exists && (
                <CommandGroup forceMount>
                  <CommandItem forceMount value={`__add__${q}`} onSelect={addCustom} className="text-teal">
                    <Plus className="mr-2 size-4" /> Add "{q}"
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {allOptions.map((o) => (
                  <CommandItem key={o} value={o} onSelect={() => toggle(o)}>
                    <Check className={cn("mr-2 size-4 text-teal", value.includes(o) ? "opacity-100" : "opacity-0")} />
                    {o}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-accent py-1 pl-3 pr-1.5 text-xs font-medium text-accent-foreground"
            >
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => toggle(v)}
                className="rounded-full p-0.5 hover:bg-teal/20"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
