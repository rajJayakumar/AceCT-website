import React from 'react'
import Link from 'next/link'
import { CalculatorIcon, BookOpenIcon, LanguageIcon, BeakerIcon } from '@heroicons/react/24/solid'

const subjectIcons: Record<string, (className: string) => React.ReactNode> = {
  calculator: (className) => <CalculatorIcon className={className} />, // Math
  book: (className) => <BookOpenIcon className={className} />, // Reading
  translate: (className) => <LanguageIcon className={className} />, // English
  flask: (className) => <BeakerIcon className={className} />, // Science
};

const subjectBg: Record<string, string> = {
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  sky: 'bg-sky-50',
  yellow: 'bg-yellow-50',
};
const subjectText: Record<string, string> = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  sky: 'text-sky-600',
  yellow: 'text-yellow-600',
};

export default function SubjectSelect() {
  const subjects = [
    {
      name: 'Math',
      icon: 'calculator',
      color: 'blue',
      description: 'Practice mathematical concepts and problem-solving',
    },
    {
      name: 'Reading',
      icon: 'book',
      color: 'green',
      description: 'Improve reading comprehension and analysis',
    },
    {
      name: 'English',
      icon: 'translate',
      color: 'sky',
      description: 'Enhance grammar, vocabulary, and writing skills',
    },
    {
      name: 'Science',
      icon: 'flask',
      color: 'yellow',
      description: 'Explore scientific concepts and principles',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Select a Subject</h1>
      <div className="flex flex-col gap-6">
        {subjects.map((subject) => (
          <Link
            key={subject.name}
            href={`/practice?subject=${subject.name.toLowerCase()}`}
            className={`group block rounded-2xl shadow-lg ${subjectBg[subject.color]} hover:shadow-none transition-shadow duration-300 p-6 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-${subject.color}-200`}
          >
            {subjectIcons[subject.icon](`w-10 h-10 mb-3 mx-auto ${subjectText[subject.color]}`)}
            <h2 className={`text-xl font-semibold mb-2 ${subjectText[subject.color]}`}>{subject.name}</h2>
            <p className="text-gray-600 text-base">{subject.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
