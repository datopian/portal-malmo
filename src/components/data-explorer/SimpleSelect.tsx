"use client";
import { Fragment } from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "lucide-react";
import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
  useForm,
} from "react-hook-form";
import { cn } from "@/lib/utils";

export interface Option<V> {
  label: string;
  value: V;
  default?: boolean;
}

type SelectValue<V> = Option<V> | null;

interface SimpleSelectProps<T extends FieldValues, V> {
  options: Array<PathValue<T, Path<T>> & Option<V>>;
  placeholder: string;
  className?: string;
  maxWidth?: string;
  formObj?: UseFormReturn<T>;
  name: Path<T>;
  id?: string;
  onChange?: (val: V) => void;
}

function getDefaultOption<V>(options: Option<V>[]): SelectValue<V> {
  return options.find((o) => o.default) ?? null;
}

function formatLabel(label: string) {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function SimpleSelect<T extends FieldValues, V>({
  options,
  placeholder,
  className,
  maxWidth = "xl:max-w-[28rem]",
  formObj,
  name,
  id,
  onChange,
}: SimpleSelectProps<T, V>) {
  const internalForm = useForm<T>();
  const control = formObj?.control ?? internalForm.control;

  const defaultValue = getDefaultOption(options);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue as PathValue<T, Path<T>>}
      render={({ field: { onChange: setSelected, value: selected } }) => {
        const selectedOption = (selected as SelectValue<V>) ?? defaultValue;

        return (
          <Listbox
            value={selectedOption}
            onChange={(next) => {
              if (next) onChange?.(next.value as V);
              setSelected(next as unknown as PathValue<T, Path<T>>);
            }}
          >
            {({ open }) => (
              <div className={cn("relative w-full", maxWidth)}>
                <ListboxButton
                  id={id}
                  className={cn(
                    "relative text-left block w-full rounded-md border-0 px-5 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6",
                    className ?? ""
                  )}
                >
                  <span
                    className={cn(
                      selectedOption?.label ? "" : "text-zinc-400",
                      "block truncate"
                    )}
                  >
                    {selectedOption?.label
                      ? formatLabel(selectedOption.label)
                      : placeholder}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </ListboxButton>

                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {options.map((option) => (
                      <ListboxOption
                        key={String(option.value)}
                        className={({ active }) =>
                          cn(
                            active ? "bg-blue-800 text-white" : "text-gray-900",
                            "relative cursor-default select-none py-2 pl-3 pr-9"
                          )
                        }
                        value={option}
                      >
                        {({ selected: isSelected }) => (
                          <span
                            className={cn(
                              isSelected ? "font-semibold" : "font-normal",
                              "block truncate"
                            )}
                          >
                            {option.label}
                          </span>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Transition>
              </div>
            )}
          </Listbox>
        );
      }}
    />
  );
}

