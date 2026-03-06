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
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
      {/* Color Swatches */}
      <h3 className="text-sm font-semibold mb-2 text-gray-700">Color</h3>
      <div className="flex gap-2 flex-wrap">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => handleSwatchClick(color)}
            className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
              selectedColor === color && colorSource === 'swatch'
                ? 'border-black scale-110'
                : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}

        {/* Custom Color Button */}
        <button
          onClick={toggleCustomPicker}
          className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 flex items-center justify-center ${
            showCustomPicker ? 'border-black scale-110' : 'border-gray-300'
          }`}
          style={{
            background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
          }}
          aria-label="Custom color picker"
          title="Custom color"
        >
          <span className="text-white text-xs font-bold drop-shadow">+</span>
        </button>
      </div>

      {/* Expandable Custom Color Wheel */}
      {showCustomPicker && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-center">
            <HexColorPicker
              color={selectedColor}
              onChange={handleWheelChange}
              style={{ width: '140px', height: '140px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
