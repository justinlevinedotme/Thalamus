import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type EmojiPickerProps = {
  value?: string;
  onChange: (emoji: string) => void;
  children: React.ReactNode;
};

type EmojiData = {
  native: string;
  unified: string;
  shortcodes: string;
};

export function EmojiPicker({ value, onChange, children }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto border-none p-0 shadow-xl" side="right" align="start">
        <Picker
          data={data}
          onEmojiSelect={(emoji: EmojiData) => onChange(emoji.native)}
          theme="light"
          previewPosition="none"
          skinTonePosition="none"
          maxFrequentRows={1}
        />
      </PopoverContent>
    </Popover>
  );
}
