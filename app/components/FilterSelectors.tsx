'use client'

import React, { useState } from 'react';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface FilterSelectorsProps {
    subject: string | null;
    selectedStandards: string[];
    selectedLevels: readonly DifficultyLevel[];
    onStandardToggle: (standard: string) => void;
    onLevelToggle: (level: DifficultyLevel) => void;
    onToggleAllStandards: () => void;
    onToggleAllLevels: () => void;
    standards: readonly string[];
    difficultyLevels: readonly DifficultyLevel[];
}

export default function FilterSelectors({
    subject,
    selectedStandards,
    selectedLevels,
    onStandardToggle,
    onLevelToggle,
    onToggleAllStandards,
    onToggleAllLevels,
    standards,
    difficultyLevels
}: FilterSelectorsProps) {
    const [showStandards, setShowStandards] = useState(false);
    const [showLevels, setShowLevels] = useState(false);

    return (
        <div className="space-y-4">
            {subject && standards.length > 0 && (
                <div className="bg-white rounded-xl shadow border p-0">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-gray-700 focus:outline-none"
                        onClick={() => setShowStandards((prev) => !prev)}
                    >
                        <span>Standards ({selectedStandards.length} selected)</span>
                        <i className={`bi bi-chevron-${showStandards ? 'up' : 'down'} text-lg`}></i>
                    </button>
                    <div
                        className={`transition-all duration-300 overflow-hidden ${showStandards ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
                        aria-hidden={!showStandards}
                    >
                        <div className="px-4 pb-4">
                            <ul className="space-y-2">
                                <li>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedStandards.length === standards.length}
                                            onChange={onToggleAllStandards}
                                            className="accent-blue-600 w-4 h-4 rounded"
                                            id="selectAllStandards"
                                        />
                                        <span className="text-gray-700">Select All</span>
                                    </label>
                                </li>
                                <li><hr className="my-1 border-gray-200" /></li>
                                {standards.map((standard) => (
                                    <li key={standard}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedStandards.includes(standard)}
                                                onChange={() => onStandardToggle(standard)}
                                                className="accent-blue-600 w-4 h-4 rounded"
                                                id={standard}
                                            />
                                            <span className="text-gray-700">{standard}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white rounded-xl shadow border p-0">
                <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-gray-700 focus:outline-none"
                    onClick={() => setShowLevels((prev) => !prev)}
                >
                    <span>Difficulty ({selectedLevels.length} selected)</span>
                    <i className={`bi bi-chevron-${showLevels ? 'up' : 'down'} text-lg`}></i>
                </button>
                <div
                    className={`transition-all duration-300 overflow-hidden ${showLevels ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
                    aria-hidden={!showLevels}
                >
                    <div className="px-4 pb-4">
                        <ul className="space-y-2">
                            <li>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedLevels.length === difficultyLevels.length}
                                        onChange={onToggleAllLevels}
                                        className="accent-blue-600 w-4 h-4 rounded"
                                        id="selectAllLevels"
                                    />
                                    <span className="text-gray-700">Select All</span>
                                </label>
                            </li>
                            <li><hr className="my-1 border-gray-200" /></li>
                            {difficultyLevels.map((level) => (
                                <li key={level}>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedLevels.includes(level)}
                                            onChange={() => onLevelToggle(level)}
                                            className="accent-blue-600 w-4 h-4 rounded"
                                            id={level}
                                        />
                                        <span className="text-gray-700">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 