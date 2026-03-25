import { useDebouncedCallback } from "use-debounce";
import { useState } from "react"
import { Input } from "@/components/ui/input"

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue);
  const debounced = useDebouncedCallback(event => onChange(event), debounce);

  // Sync local state if initialValue changes externally (adjusting state based on props)
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setValue(initialValue);
  }

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        debounced(e);
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )
}
