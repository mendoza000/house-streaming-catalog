"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import type { Country } from "react-phone-number-input";
import { getCountryCallingCode } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CountryOption {
  value?: Country;
  label: string;
}

interface CountrySelectProps {
  value?: Country;
  onChange: (value?: Country) => void;
  options: CountryOption[];
  disabled?: boolean;
  readOnly?: boolean;
}

function FlagIcon({ country }: { country?: Country }) {
  if (!country) return null;
  const Flag = flags[country];
  if (!Flag) return null;
  return (
    <span className="flex h-4 w-6 shrink-0 items-center overflow-hidden rounded-[2px]">
      <Flag title={country} />
    </span>
  );
}

export function CountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  // Forzamos país (sin opción internacional), filtramos valores vacíos.
  const countries = React.useMemo(
    () =>
      options.filter((option): option is { value: Country; label: string } =>
        Boolean(option.value),
      ),
    [options],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar país"
          disabled={disabled || readOnly}
          className="h-9 gap-1 px-2"
        >
          <FlagIcon country={value} />
          <ChevronDownIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar país..." />
          <CommandList>
            <CommandEmpty>No se encontró el país.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} +${getCountryCallingCode(country.value)}`}
                  onSelect={() => {
                    onChange(country.value);
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <FlagIcon country={country.value} />
                  <span className="flex-1 truncate">{country.label}</span>
                  <span className="text-muted-foreground text-sm">
                    +{getCountryCallingCode(country.value)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
