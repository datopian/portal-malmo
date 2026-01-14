

const DateRange = ( ) => {

  return (
   <div className="min-h-[34px]"></div>
  );
};

export default DateRange;

/*"use client";
import { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";

import type { DateValueType } from "react-tailwindcss-datepicker";

interface DateRangeProps {
  onSelect: (range: [string | null, string | null]) => void;
}

const DateRange = ({ onSelect }: DateRangeProps) => {
  const [value, setValue] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });


  const handleChange = (newValue: DateValueType) => {
    setValue(newValue);
    onSelect([
      newValue?.startDate ? newValue.startDate.toString() : null,
      newValue?.endDate ? newValue.endDate.toString() : null,
    ]);
  };
  return (
    <Datepicker
      value={value}
      onChange={handleChange}
      asSingle={false}
      showShortcuts={false}
      showFooter={false}
      containerClassName="relative"
      popoverDirection="down"
    />
  );
};

export default DateRange;*/