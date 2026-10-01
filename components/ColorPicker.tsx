import {
  CATEGORY_COLOR_NAMES,
  CATEGORY_COLORS,
  type CategoryColor,
} from "@/lib/categoryColors";

export function ColorPicker({
  value,
  onChange,
}: {
  value: CategoryColor;
  onChange: (color: CategoryColor) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORY_COLOR_NAMES.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={color}
          aria-pressed={value === color}
          className={`w-7 h-7 rounded-full transition ${
            value === color
              ? "ring-2 ring-offset-2 ring-indigo-600 dark:ring-offset-neutral-900"
              : ""
          }`}
          style={{ backgroundColor: CATEGORY_COLORS[color].primary }}
        />
      ))}
    </div>
  );
}
