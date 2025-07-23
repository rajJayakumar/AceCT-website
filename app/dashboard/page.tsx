'use client'
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip, ResponsiveContainer, XAxis, Legend, Bar, YAxis } from 'recharts';
import Link from 'next/link';
import { CalculatorIcon, BookOpenIcon, LanguageIcon, BeakerIcon } from '@heroicons/react/24/solid';
import Head from 'next/head';
import { GraduationCap } from 'lucide-react';

const SUBJECTS = ['math', 'reading', 'english', 'science'];

const SUBJECT_META = [
  {
    key: 'math',
    name: 'Math',
    color: 'bg-blue-400',
    icon: CalculatorIcon,
    href: '/practice?subject=math',
  },
  {
    key: 'reading',
    name: 'Reading',
    color: 'bg-rose-400',
    icon: BookOpenIcon,
    href: '/practice?subject=reading',
  },
  {
    key: 'english',
    name: 'English',
    color: 'bg-yellow-400',
    icon: LanguageIcon,
    href: '/practice?subject=english',
  },
  {
    key: 'science',
    name: 'Science',
    color: 'bg-emerald-400',
    icon: BeakerIcon,
    href: '/practice?subject=science',
  },
];

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d;
}

function formatDay(date: Date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]} ${date.getMonth() + 1}/${date.getDate()}`;
}

const TOTAL_QUESTIONS = 600; // Placeholder for total ACT prep questions
const AVG_TIME_PER_Q = 45; // seconds
const MIN_QUESTIONS_PER_DAY = 5; // minimum allowed
const MAX_QUESTIONS_PER_DAY = 40; // maximum allowed

function getDailyACTPlan(testDate: string, totalQuestions: number, avgTimePerQ: number = 45) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(testDate);
  endDate.setHours(0, 0, 0, 0);
  const diffDays = Math.max(Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), 1);
  let questionsPerDay = Math.ceil(totalQuestions / diffDays);
  questionsPerDay = Math.max(MIN_QUESTIONS_PER_DAY, Math.min(MAX_QUESTIONS_PER_DAY, questionsPerDay));
  const minutesPerDay = Math.ceil((questionsPerDay * avgTimePerQ) / 60);
  return {
    daysLeft: diffDays,
    questionsPerDay,
    minutesPerDay
  };
}

export default function HomePage() {
  const { user } = useAuth();
  const [weekData, setWeekData] = useState<any[]>([]);
  const [accuracyData, setAccuracyData] = useState<any[]>([]);
  const [username, setUserName] = useState('');
  const [weeklyStats, setWeeklyStats] = useState({
    totalAccuracy: 0,
    totalQuestions: 0,
    totalTime: 0
  });
  const [testDate, setTestDate] = useState('');
  const [questionsPerDay, setQuestionsPerDay] = useState(15);
  const [minutesPerDay, setMinutesPerDay] = useState(25);
  const [daysLeft, setDaysLeft] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Track how many questions completed today
  const [questionsToday, setQuestionsToday] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserName(userData?.name || 'User');
      // Get ACT test date and questionsPerDay from user profile if available
      let userTestDate = userData?.actTestDate || '';
      let userQuestionsPerDay = userData?.actQuestionsPerDay || null;
      // If not set, default to 30 days from today
      if (!userTestDate) {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        userTestDate = d.toISOString().slice(0, 10);
      }
      // Calculate plan
      const plan = getDailyACTPlan(userTestDate, TOTAL_QUESTIONS, AVG_TIME_PER_Q);
      setTestDate(userTestDate);
      setQuestionsPerDay(userQuestionsPerDay || plan.questionsPerDay);
      setMinutesPerDay(plan.minutesPerDay);
      setDaysLeft(plan.daysLeft);
      // Save to Firestore if not present
      if (!userData?.actTestDate || !userData?.actQuestionsPerDay) {
        await updateDoc(doc(db, 'users', user.uid), {
          actTestDate: userTestDate,
          actQuestionsPerDay: plan.questionsPerDay
        });
      }
      // Weekly/accuracy data
      const weekData: any = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfWeek = getStartOfWeek(today);
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        weekData[d.toDateString()] = {
          name: formatDay(d),
          math: 0,
          reading: 0,
          english: 0,
          science: 0
        };
      }
      const accArr: { subject: string; acc: number }[] = [];
      let totalCorrect = 0;
      let totalQuestions = 0;
      let totalTime = 0;
      let todayCount = 0;
      for (const subject of SUBJECTS) {
        const old = userData?.questions?.[subject]?.old || {};
        let correct = 0;
        let total = 0;
        Object.values(old).forEach((q: any) => {
          if (q && q.date) {
            const qDate = new Date(q.date);
            qDate.setHours(0, 0, 0, 0);
            if (qDate >= startOfWeek && qDate <= today) {
              const key = qDate.toDateString();
              if (weekData[key]) {
                weekData[key][subject] += 1;
              }
              total++;
              if (q.correct) correct++;
              totalQuestions++;
              if (q.correct) totalCorrect++;
              if (q.time) totalTime += q.time;
            }
            // Count questions completed today
            if (qDate.getTime() === today.getTime()) {
              todayCount++;
            }
          }
        });
        accArr.push({
          subject: subject.charAt(0).toUpperCase() + subject.slice(1),
          acc: total > 0 ? Math.round((correct / total) * 100) : 0
        });
      }
      setQuestionsToday(todayCount);
      const result = Object.values(weekData);
      setWeekData(result);
      setAccuracyData(accArr);
      setWeeklyStats({
        totalAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
        totalQuestions,
        totalTime
      });
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Handle test date change
  const handleTestDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTestDate(newDate);
    setSaving(true);
    // Recalculate plan
    const plan = getDailyACTPlan(newDate, TOTAL_QUESTIONS, AVG_TIME_PER_Q);
    setQuestionsPerDay(plan.questionsPerDay);
    setMinutesPerDay(plan.minutesPerDay);
    setDaysLeft(plan.daysLeft);
    // Save to Firestore
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        actTestDate: newDate,
        actQuestionsPerDay: plan.questionsPerDay
      });
    }
    setSaving(false);
  };

  return (
    <>
    <Head>
      <GraduationCap className='bg-linear-to-r from-blue-500 to-indigo-500'/>
      <title>Dashboard | AceCT</title>
    </Head>
    <div className="min-h-screen bg-gray-100 py-10">
  <div className="flex flex-col items-center w-full max-w-8xl mx-auto px-4 gap-10">

    {/* Username */}
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800">{username}</h1>
    </div>

    {/* Subject Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {SUBJECT_META.map((sub) => (
        <Link
          key={sub.key}
          href={sub.href}
          className={`flex items-center gap-3 justify-center px-6 py-4 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-none cursor-pointer ${sub.color} group`}
        >
          <sub.icon className="w-7 h-7 text-white" />
          <h5 className="font-semibold text-lg text-white group-hover:underline">{sub.name}</h5>
        </Link>
      ))}
    </div>

    {/* Chart Cards */}
    <div className="flex flex-wrap gap-8 justify-center w-full">
      {/* Weekly Statistics */}
      <div className="flex-1 flex flex-col justify-center gap-4 max-w-[230px]">
          <div className="bg-blue-50 rounded-lg shadow-lg p-4 text-center hover:shadow-none transition-shadow duration-300">
            <div className="transition-shadow duration-300 hover:shadow-none">
            <div className="text-3xl font-bold text-blue-600">{weeklyStats.totalAccuracy}%</div>
            <div className="text-gray-600">Average Accuracy</div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-lg p-4 text-center hover:shadow-none transition-shadow duration-300">
            <div className="transition-shadow duration-300 hover:shadow-none">
            <div className="text-3xl font-bold text-green-600">{weeklyStats.totalQuestions}</div>
            <div className="text-gray-600">Total Questions</div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-lg p-4 text-center hover:shadow-none transition-shadow duration-300">
            <div className="transition-shadow duration-300 hover:shadow-none">
            <div className="text-3xl font-bold text-purple-600">
              {Math.floor(weeklyStats.totalTime / 60)}h {weeklyStats.totalTime % 60}m
            </div>
            <div className="text-gray-600">Time Spent</div>
            </div>
          </div>
        </div>


      <div className="bg-white rounded-xl shadow-lg hover:shadow-none transition-shadow duration-300 p-8 flex flex-col min-h-[350px] min-w-[350px]">
        <h3 className="text-s font-semibold mb-4 text-center">Accuracy</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={accuracyData}>
              <PolarGrid  />
              <PolarAngleAxis dataKey="subject"  />
              <PolarRadiusAxis  />
              <Radar name="Accuracy" dataKey="acc" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6}/>
              
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Questions */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-none transition-shadow duration-300 p-8 flex flex-col min-h-[350px]">
        <h3 className="text-l font-semibold mb-4 text-center">Questions</h3>
        <div className="flex-1">
          <ResponsiveContainer width={400} height={250}>
            <BarChart
              height={250}
              width={250}
              data={weekData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="math" stackId="a" fill="#60a5fa" />
              <Bar dataKey="reading" stackId="a" fill="#fb7185" />
              <Bar dataKey="english" stackId="a" fill="#facc15" />
              <Bar dataKey="science" stackId="a" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* New Row: ACT Test Date, Recommended Questions, Progress Bar */}
    <div className="flex flex-wrap gap-8 justify-center w-full">
      {/* ACT Test Date */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center min-w-[220px] max-w-[260px] flex-1 justify-center hover:shadow-none transition-shadow duration-300">
        <div className="font-semibold text-gray-700 mb-5">ACT Test Date</div>
        <input
          type="date"
          className="border border-gray-300 rounded-lg px-3 py-2 text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={testDate}
          onChange={handleTestDateChange}
          disabled={saving}
        />
      </div>
      {/* Recommended Questions Per Day */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center min-w-[220px] max-w-[260px] flex-1 hover:shadow-none transition-shadow duration-300">
        <div className="font-semibold text-gray-700 mb-2 text-center">Recommended Questions/Day</div>
        <div className="text-3xl font-bold text-blue-600 mb-1">{questionsPerDay}</div>
        <div className="text-gray-500 text-sm">~{minutesPerDay} min</div>
        <div className="text-gray-400 text-xs mt-1">{daysLeft} days left</div>
      </div>
      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-center max-w-[500px] flex-[2] hover:shadow-none transition-shadow duration-300">
        <div className="font-semibold text-gray-700 mb-2">Today's Progress</div>
        <div className="flex items-center gap-4 mb-2">
          <div className="text-lg font-bold text-blue-600">{questionsToday}</div>
          <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-4 bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, Math.round((questionsToday / questionsPerDay) * 100))}%` }}></div>
          </div>
          <div className="text-lg font-bold text-gray-600">/ {questionsPerDay}</div>
        </div>
        <div className="text-gray-500 text-sm">{questionsToday} of {questionsPerDay} questions completed today</div>
      </div>
    </div>
  </div>
</div>
</>
  );
} 