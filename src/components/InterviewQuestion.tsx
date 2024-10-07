import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface InterviewQuestionProps {
  question: string;
  onComplete: (answer: string) => void;
  isRecording: boolean;
  getFeedback: (question: string, answer: string) => Promise<string>;
}

const InterviewQuestion: React.FC<InterviewQuestionProps> = ({ question, onComplete, isRecording, getFeedback }) => {
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let recognition: SpeechRecognition | null = null;

    if (isRecording && isAnswering) {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setAnswer(transcript);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
        };

        recognition.start();
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isRecording, isAnswering]);

  const handleToggleAnswering = () => {
    setIsAnswering(!isAnswering);
  };

  const handleNextQuestion = async () => {
    setIsAnswering(false);

    try {
      const feedbackText = await getFeedback(question, answer);
      setFeedback(feedbackText);
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedback('Unable to generate feedback at this time.');
    }

    onComplete(answer);
    setAnswer(''); // Reset the answer for the next question
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">{question}</h2>
      <p className="mb-4">{answer}</p>
      {isRecording ? (
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded flex items-center ${isAnswering ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
            onClick={handleToggleAnswering}
          >
            {isAnswering ? <MicOff size={24} className="mr-2" /> : <Mic size={24} className="mr-2" />}
            {isAnswering ? 'Stop Answering' : 'Start Answering'}
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleNextQuestion}
          >
            Next Question
          </button>
        </div>
      ) : (
        <p className="text-gray-500 italic">Please start recording to answer the question.</p>
      )}
      {feedback && (
        <div className="mt-4 p-4 bg-blue-100 rounded">
          <h3 className="font-semibold">AI Feedback:</h3>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default InterviewQuestion;