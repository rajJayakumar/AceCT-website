'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

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
    const standardsRef = useRef<HTMLDivElement>(null);
    const levelsRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (standardsRef.current && !standardsRef.current.contains(event.target as Node)) {
                setShowStandards(false);
            }
            if (levelsRef.current && !levelsRef.current.contains(event.target as Node)) {
                setShowLevels(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="space-y-4">
            {subject && standards.length > 0 && (
                <div ref={standardsRef} className="relative bg-white rounded-xl shadow border p-0">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-gray-700 focus:outline-none"
                        onClick={() => setShowStandards((prev) => !prev)}
                    >
                        <span>Standards</span>
                        {showStandards ? (
                            <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        )}
                    </button>
                    <div
                        className={`absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-b-xl shadow-lg transition-all duration-300 overflow-hidden ${showStandards ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
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
            <div ref={levelsRef} className="relative bg-white rounded-xl shadow border p-0">
                <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-gray-700 focus:outline-none"
                    onClick={() => setShowLevels((prev) => !prev)}
                >
                    <span>Difficulty</span>
                    {showLevels ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    )}
                </button>
                <div
                    className={`absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-b-xl shadow-lg transition-all duration-300 overflow-hidden ${showLevels ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
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