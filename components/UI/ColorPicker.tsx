import React from 'react';
import { COLORS } from '@/utils/constants';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

/**
 * Color palette selector
 */
export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">Color</h3>
      <div className="flex gap-2 flex-wrap">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
              selectedColor === color ? 'border-black scale-110' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
