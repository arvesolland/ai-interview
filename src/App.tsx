import React, { useState, useEffect } from 'react';
import InterviewQuestion from './components/InterviewQuestion';
import Timer from './components/Timer';
import CameraRecording from './components/CameraRecording';
import { Play } from 'lucide-react';

const questions = [
  "Tell me about yourself.",
  "What are your strengths and weaknesses?",
  "Where do you see yourself in 5 years?",
  "Why should we hire you?",
  "Do you have any questions for us?"
];

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [isRecording, setIsRecording] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (currentQuestionIndex === questions.length) {
      setIsInterviewComplete(true);
      setIsRecording(false);
    }
  }, [currentQuestionIndex]);

  const handleNextQuestion = (answer: string) => {
    setAnswers(prevAnswers => [...prevAnswers, answer]);
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
  };

  const handleStartInterview = () => {
    setIsInterviewStarted(true);
    setCurrentQuestionIndex(0);
  };

  const getFeedback = async (question: string, answer: string) => {
    try {
      // In a real-world scenario, this would be a call to your backend service
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, answer }),
      });

      if (!response.ok) {
        throw new Error('Failed to get feedback');
      }

      const data = await response.json();
      return data.feedback;
    } catch (error) {
      console.error('Error getting feedback:', error);
      return 'Unable to generate feedback at this time.';
    }
  };

  const renderProgressIndicator = () => {
    if (currentQuestionIndex === -1) return null;
    return (
      <div className="w-full max-w-2xl mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">AI-Powered Interview</h1>
      {!isInterviewComplete ? (
        <>
          <Timer isRunning={isRecording} />
          <CameraRecording 
            isRecording={isRecording} 
            setIsRecording={setIsRecording} 
          />
          {isRecording && !isInterviewStarted && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center mb-4"
              onClick={handleStartInterview}
            >
              <Play size={24} className="mr-2" />
              Start Interview
            </button>
          )}
          {renderProgressIndicator()}
          {isInterviewStarted && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && (
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 mb-4">
              <InterviewQuestion
                question={questions[currentQuestionIndex]}
                onComplete={handleNextQuestion}
                isRecording={isRecording}
                getFeedback={getFeedback}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-2xl font-semibold">
          Interview Complete! Thank you for your participation.
        </div>
      )}
      {isInterviewComplete && (
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Interview Summary</h2>
          {questions.map((question, index) => (
            <div key={index} className="mb-4 p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold">{question}</h3>
              <p className="mt-2">{answers[index]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;