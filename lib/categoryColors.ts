export type CategoryColor =
  | "sage"
  | "pink"
  | "peach"
  | "yellow"
  | "blue"
  | "lavender"
  | "terracotta"
  | "gray";

export const CATEGORY_COLOR_NAMES: CategoryColor[] = [
  "sage",
  "pink",
  "peach",
  "yellow",
  "blue",
  "lavender",
  "terracotta",
  "gray",
];

export const CATEGORY_COLORS: Record<
  CategoryColor,
  { primary: string; bg: string; text: string }
> = {
  sage: { primary: "#ADC1B4", bg: "#E6EDE8", text: "#4F6A5B" },
  pink: { primary: "#E1C8C0", bg: "#F6ECE9", text: "#8A5A50" },
  peach: { primary: "#E4C79E", bg: "#F7EDDD", text: "#8A6428" },
  yellow: { primary: "#E6DCA6", bg: "#F7F3DC", text: "#7A6D1E" },
  blue: { primary: "#B3C6D4", bg: "#E8EEF3", text: "#4A6378" },
  lavender: { primary: "#CBC3DC", bg: "#EFECF5", text: "#655A82" },
  terracotta: { primary: "#DBA996", bg: "#F6E9E4", text: "#8A4A36" },
  gray: { primary: "#C9C9C3", bg: "#EEEEEB", text: "#5E5E58" },
};
