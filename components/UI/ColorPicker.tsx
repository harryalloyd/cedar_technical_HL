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
 * Color palette selector with swatches + custom color wheel
 */
export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const [colorSource, setColorSource] = useState<ColorSource>('swatch');

  const handleSwatchClick = (color: string) => {
    onColorChange(color);
    setColorSource('swatch');
  };

  const handleWheelChange = (color: string) => {
    onColorChange(color);
    setColorSource('wheel');
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg w-[220px]">
      {/* Quick Color Swatches */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wide">
          Quick Colors
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleSwatchClick(color)}
              className={`w-10 h-10 rounded border-2 transition-all hover:scale-110 ${
                selectedColor === color && colorSource === 'swatch'
                  ? 'border-white border-4 shadow-lg scale-110'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Custom Color Wheel */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-wide">
          Custom Color
        </h3>
        <div className="flex justify-center">
          <HexColorPicker
            color={selectedColor}
            onChange={handleWheelChange}
            style={{ width: '180px', height: '180px' }}
          />
        </div>
      </div>

      {/* Current Color Indicator */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Current:</span>
          <div className="flex items-center gap-2">
            <div
              className="w-12 h-8 rounded border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-xs font-mono text-gray-700">
              {selectedColor.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
