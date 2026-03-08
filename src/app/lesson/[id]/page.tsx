'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Lesson = {
  _id: string;
  title: string;
  duration: string;
  module: string;
  videoUrl: string;
};

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();

  // 🔥 Simulated Course Lessons
  const lessonsList: Lesson[] = [
    {
      _id: '1',
      title: 'Introduction to JavaScript',
      duration: '10:45',
      module: 'JavaScript Fundamentals',
      videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk'
    },
    {
      _id: '2',
      title: 'Variables and Data Types',
      duration: '12:30',
      module: 'JavaScript Fundamentals',
      videoUrl: 'https://www.youtube.com/embed/Bv_5Zv5c-Ts'
    },
    {
      _id: '3',
      title: 'Functions and Scope',
      duration: '14:20',
      module: 'JavaScript Fundamentals',
      videoUrl: 'https://www.youtube.com/embed/N8ap4k_1QEQ'
    }
  ];

  const currentIndex = lessonsList.findIndex(
    l => l._id === params.id
  );

  const currentLesson =
    lessonsList[currentIndex] || lessonsList[0];

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text:
        "Hello! I'm your AI Tutor. Ask me anything about this lesson."
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const progress =
    (completedLessons.length / lessonsList.length) * 100;

  const markComplete = () => {
    if (!completedLessons.includes(currentLesson._id)) {
      setCompletedLessons([...completedLessons, currentLesson._id]);
    }
  };

  const goNext = () => {
    if (currentIndex < lessonsList.length - 1) {
      router.push(`/lesson/${lessonsList[currentIndex + 1]._id}`);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      router.push(`/lesson/${lessonsList[currentIndex - 1]._id}`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputValue
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'ai',
          text:
            "Great question! Let me explain that clearly for you..."
        }
      ]);
    }, 700);
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">

      {/* LEFT SIDEBAR */}
      <aside className="w-72 bg-white border-r border-gray-300 flex flex-col">

        <div className="p-5 border-b border-gray-300">
          <h2 className="text-xs font-bold text-blue-700 uppercase">
            Course
          </h2>
          <h3 className="text-sm font-semibold text-gray-900 mt-1">
            Complete Web Development Bootcamp
          </h3>

          {/* Progress */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round(progress)}% Progress
            </p>
          </div>
        </div>

        {/* Module + Lessons */}
        <div className="flex-1 overflow-y-auto p-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
            Current Module
          </h4>

          <div className="space-y-2">
            {lessonsList.map((lesson, index) => (
              <div
                key={lesson._id}
                onClick={() =>
                  router.push(`/lesson/${lesson._id}`)
                }
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                  lesson._id === currentLesson._id
                    ? 'bg-blue-100 border border-blue-400'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div
                  className={`w-6 h-6 text-xs rounded-full flex items-center justify-center ${
                    completedLessons.includes(lesson._id)
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {completedLessons.includes(lesson._id)
                    ? '✓'
                    : index + 1}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {lesson.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="p-5 border-t border-gray-300 flex justify-between text-center text-sm">
          <div>
            <p className="font-bold text-gray-900">
              {completedLessons.length}
            </p>
            <p className="text-gray-600 text-xs">Completed</p>
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {lessonsList.length - completedLessons.length}
            </p>
            <p className="text-gray-600 text-xs">Remaining</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex">

        {/* CENTER AREA */}
        <div className="flex-1 flex flex-col">

       {/* TOP BAR */}
<div className="h-16 bg-white border-b border-gray-300 px-6 flex items-center justify-between">
  <div>
    <h1 className="text-lg font-bold text-gray-900">
      Lesson {currentIndex + 1}: {currentLesson.title}
    </h1>
    <p className="text-xs text-gray-600">
      {currentLesson.duration} • {currentLesson.module}
    </p>
  </div>

  {/* Take Quiz Button */}
  <button
    onClick={() => alert("Quiz feature coming soon!")}
    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition"
  >
    Take Quiz
  </button>
</div>

{/* VIDEO SECTION */}
<div className="flex-1 overflow-y-auto p-8 bg-gray-100">

  <div className="bg-white p-6 rounded-xl shadow border border-gray-300">

    {/* YouTube Video */}
    <div className="aspect-video rounded-xl overflow-hidden">
      <iframe
        src={currentLesson.videoUrl}
        allowFullScreen
        className="w-full h-full"
      />
    </div>

    {/* Navigation + Complete */}
    <div className="flex items-center justify-between mt-6">

      <button
        onClick={goPrev}
        disabled={currentIndex === 0}
        className="px-4 py-2 border border-gray-400 rounded-lg text-sm text-gray-800 disabled:opacity-40"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-4">

        {/* Mark as Complete */}
        <button
          onClick={markComplete}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
        >
          Mark as Complete
        </button>

        <span className="text-sm text-gray-700 font-medium">
          Lesson {currentIndex + 1} of {lessonsList.length}
        </span>

      </div>

      <button
        onClick={goNext}
        disabled={currentIndex === lessonsList.length - 1}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-40"
      >
        Next →
      </button>

    </div>
  </div>

  {/* EXPLORE MORE COURSES */}
  <div className="mt-10">
    <h2 className="text-lg font-semibold text-gray-900">
      Explore More Courses
    </h2>
    <p className="text-sm text-gray-600 mb-5">
      Continue your learning journey
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {[
        {
          title: "Advanced React Masterclass",
          image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee"
        },
        {
          title: "Node.js Backend Bootcamp",
          image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c"
        },
        {
          title: "MongoDB Complete Guide",
          image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4"
        }
      ].map((course, index) => (
        <div
          key={index}
          onClick={() => router.push('/dashboard')}
          className="bg-white rounded-xl shadow border border-gray-300 overflow-hidden cursor-pointer hover:shadow-lg transition"
        >
          <img
            src={course.image}
            alt={course.title}
            className="h-40 w-full object-cover"
          />
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {course.title}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Explore course →
            </p>
          </div>
        </div>
      ))}

    </div>
  </div>

</div>
</div>

        {/* RIGHT AI CHAT */}
        <div className="w-96 bg-white border-l border-gray-300 flex flex-col">

          {/* Header */}
          <div className="p-4 border-b border-gray-300 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">
              AI Tutor
            </p>
            <p className="text-xs text-green-600 font-medium">
              ● Online
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-100">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-sm max-w-xs shadow ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-300 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-300 bg-white">
            <form
              onSubmit={handleSendMessage}
              className="flex gap-2"
            >
              <input
                value={inputValue}
                onChange={e =>
                  setInputValue(e.target.value)
                }
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-400 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg text-sm font-medium"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
