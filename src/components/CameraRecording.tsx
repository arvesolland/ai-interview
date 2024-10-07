import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Video, VideoOff, Mic, Camera } from 'lucide-react';

interface CameraRecordingProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

interface Device {
  deviceId: string;
  kind: string;
  label: string;
}

const CameraRecording: React.FC<CameraRecordingProps> = ({ isRecording, setIsRecording }) => {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');

  useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setDevices(devices);
        const videoDevice = devices.find(device => device.kind === 'videoinput');
        const audioDevice = devices.find(device => device.kind === 'audioinput');
        if (videoDevice) setSelectedVideoDevice(videoDevice.deviceId);
        if (audioDevice) setSelectedAudioDevice(audioDevice.deviceId);
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    }
    getDevices();
  }, []);

  const handleStartRecording = async () => {
    setRecordedChunks([]);
    if (webcamRef.current) {
      try {
        const stream = await getMediaStream();
        webcamRef.current.video!.srcObject = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    }
  };

  const getMediaStream = async () => {
    const videoConstraints = { 
      deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
      width: 1280, 
      height: 720 
    };
    const audioConstraints = { 
      deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
      echoCancellation: true, 
      noiseSuppression: true 
    };
    
    return await navigator.mediaDevices.getUserMedia({ 
      video: videoConstraints, 
      audio: audioConstraints 
    });
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      setRecordedChunks((prev) => prev.concat(event.data));
    }
  };

  const handleDownload = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      a.href = url;
      a.download = "interview-recording.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  };

  const handleDeviceChange = async (event: React.ChangeEvent<HTMLSelectElement>, type: 'video' | 'audio') => {
    const deviceId = event.target.value;
    if (type === 'video') {
      setSelectedVideoDevice(deviceId);
    } else {
      setSelectedAudioDevice(deviceId);
    }

    if (!isRecording) {
      try {
        const stream = await getMediaStream();
        if (webcamRef.current && webcamRef.current.video) {
          webcamRef.current.video.srcObject = stream;
        }
      } catch (err) {
        console.error("Error updating media stream:", err);
      }
    }
  };

  return (
    <div className="mb-4">
      <Webcam
        audio={false}
        videoConstraints={{
          deviceId: selectedVideoDevice
        }}
        ref={webcamRef}
        className="w-full max-w-md rounded-lg shadow-md"
      />
      <div className="mt-2 flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-2">
          <Camera size={24} />
          <select 
            value={selectedVideoDevice} 
            onChange={(e) => handleDeviceChange(e, 'video')}
            className="p-2 border rounded"
          >
            {devices.filter(device => device.kind === 'videoinput').map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Mic size={24} />
          <select 
            value={selectedAudioDevice} 
            onChange={(e) => handleDeviceChange(e, 'audio')}
            className="p-2 border rounded"
          >
            {devices.filter(device => device.kind === 'audioinput').map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>
        {!isRecording ? (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
            onClick={handleStartRecording}
          >
            <Video size={24} className="mr-2" />
            Start Recording
          </button>
        ) : (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded flex items-center"
            onClick={handleStopRecording}
          >
            <VideoOff size={24} className="mr-2" />
            Stop Recording
          </button>
        )}
        {recordedChunks.length > 0 && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleDownload}
          >
            Download Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraRecording;