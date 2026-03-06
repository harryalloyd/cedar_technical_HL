'use client';

import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { COLORS } from '@/utils/constants';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

type ColorSource = 'swatch' | 'wheel';

/**
 * Color palette selector with swatches + expandable custom color wheel
 */
export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const [colorSource, setColorSource] = useState<ColorSource>('swatch');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handleSwatchClick = (color: string) => {
    onColorChange(color);
    setColorSource('swatch');
  };

  const handleWheelChange = (color: string) => {
    onColorChange(color);
    setColorSource('wheel');
  };

  const toggleCustomPicker = () => {
    setShowCustomPicker(!showCustomPicker);
  };

  return (
    <div>
      {/* Color Swatches */}
      <div className="flex justify-center">
        <div className="grid grid-cols-4 gap-x-2 gap-y-1">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleSwatchClick(color)}
              className={`w-8 h-8 rounded border-2 transition-all hover:scale-105 ${
                selectedColor === color && colorSource === 'swatch'
                  ? 'border-black scale-105'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}

          {/* Custom Color Button */}
          <button
            type="button"
            onClick={toggleCustomPicker}
            className={`w-8 h-8 rounded border-2 transition-all hover:scale-105 flex items-center justify-center ${
              colorSource === 'wheel' && showCustomPicker ? 'border-black scale-105' : 'border-gray-300'
            }`}
            style={{
              background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
            }}
            aria-label="Custom color picker"
            title="Custom color"
          >
            <span className="text-white text-xs font-bold drop-shadow-lg">+</span>
          </button>
        </div>
      </div>

      {/* Expandable Custom Color Wheel */}
      {showCustomPicker && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-center">
            <HexColorPicker
              color={selectedColor}
              onChange={handleWheelChange}
              style={{ width: '160px', height: '160px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
