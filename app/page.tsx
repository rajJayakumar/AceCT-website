'use client'
import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { db } from './firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip, ResponsiveContainer, XAxis, Legend, Bar, YAxis } from 'recharts';

const SUBJECTS = ['math', 'reading', 'english', 'science'];

const SUBJECT_META = [
  {
    key: 'math',
    name: 'Math',
    color: '#8884d8',
    icon: 'bi-calculator',
  },
  {
    key: 'reading',
    name: 'Reading',
    color: '#82ca9d',
    icon: 'bi-book',
  },
  {
    key: 'english',
    name: 'English',
    color: '#ffb347',
    icon: 'bi-pencil',
  },
  {
    key: 'science',
    name: 'Science',
    color: '#00bfff',
    icon: 'bi-beaker',
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

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserName(userData?.name || 'User')
      const weekData: any = {};
      const today = new Date();
      const startOfWeek = getStartOfWeek(today);
      // Prepare a map for each day of the week
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
      // For accuracy and weekly stats
      const accArr: { subject: string; acc: number }[] = [];
      let totalCorrect = 0;
      let totalQuestions = 0;
      let totalTime = 0;
      // Go through all subjects and their answered questions
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
              // For accuracy
              total++;
              if (q.correct) correct++;
              // For weekly stats
              totalQuestions++;
              if (q.correct) totalCorrect++;
              if (q.timeSpent) totalTime += q.timeSpent;
            }
          }
        });
        accArr.push({
          subject: subject.charAt(0).toUpperCase() + subject.slice(1),
          acc: total > 0 ? Math.round((correct / total) * 100) : 100
        });
      }
      // Convert to array in order from Sun to Sat
      const result = Object.values(weekData);
      setWeekData(result);
      setAccuracyData(accArr);
      setWeeklyStats({
        totalAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
        totalQuestions,
        totalTime
      });
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
  <div className="flex flex-col items-center w-full max-w-8xl mx-auto px-4 gap-10">

    {/* Username */}
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800">{username}</h1>
    </div>

    {/* Subject Cards */}
    <div className="grid grid-cols-4 gap-4">
      {SUBJECT_META.map((sub) => (
        <div
          key={sub.key}
          className="items-center flex gap-3 justify-center px-6 py-2 rounded-xl shadow hover:shadow-none transition-shadow duration-300"
          style={{ background: sub.color }}
        >
          <div className="mb-2">
            <i className={`bi ${sub.icon}`} style={{ fontSize: 32, color: 'white' }}></i>
          </div>
          <h5 className="font-semibold text-lg text-white">{sub.name}</h5>
        </div>
      ))}
    </div>

    {/* Chart Cards */}
    <div className="flex flex-wrap gap-8 justify-center w-full">
      {/* Weekly Statistics */}
      
        <div className="flex-1 flex flex-col justify-center gap-4 max-w-[230px]">
          <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{weeklyStats.totalAccuracy}%</div>
            <div className="text-gray-600">Average Accuracy</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{weeklyStats.totalQuestions}</div>
            <div className="text-gray-600">Total Questions</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Math.floor(weeklyStats.totalTime / 60)}h {weeklyStats.totalTime % 60}m
            </div>
            <div className="text-gray-600">Time Spent</div>
          </div>
        </div>
      

      <div className="bg-white rounded-xl shadow hover:shadow-none transition-shadow duration-300 p-8 flex flex-col min-h-[350px] min-w-[350px]">
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
      <div className="bg-white rounded-xl shadow hover:shadow-none transition-shadow duration-300 p-8 flex flex-col min-h-[350px]">
        <h3 className="text-l font-semibold mb-4 text-center">Questions</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={weekData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* <Bar dataKey="math" stackId="a" fill="#8884d8" />
              <Bar dataKey="reading" stackId="a" fill="#82ca9d" />
              <Bar dataKey="english" stackId="a" fill="#ffb347" />
              <Bar dataKey="science" stackId="a" fill="#00bfff" /> */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}
