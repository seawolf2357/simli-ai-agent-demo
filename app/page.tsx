"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { SimliClient } from "simli-client";

const simli_faceid = "9f3a3361-41b4-4157-87e6-9e6e4557ca7f";
const elevenlabs_voiceid = "1W00IGEmNmwmsDeYy7ag";

const simliClient = new SimliClient();

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Demo = () => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatgptText, setChatgptText] = useState("");
  const [startWebRTC, setStartWebRTC] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [showConversation, setShowConversation] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: true,
        videoRef: videoRef,
        audioRef: audioRef,
      };

      simliClient.Initialize(SimliConfig);
      console.log("Simli Client initialized");
    }

    return () => {
      simliClient.close();
    };
  }, [videoRef, audioRef]);

  useEffect(() => {
    simliClient.on("connected", () => {
      setIsLoading(false);
      console.log("SimliClient is now connected!");
    });

    simliClient.on("disconnected", () => {
      console.log("SimliClient has disconnected!");
    });

    simliClient.on("failed", () => {
      console.log("SimliClient has failed to connect!");
    });
  }, []);

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const handleStart = () => {
    simliClient.start();
    setStartWebRTC(true);
    setIsLoading(true);

    setTimeout(() => {
      const audioData = new Uint8Array(6000).fill(0);
      simliClient.sendAudioData(audioData);
    }, 4000);

    audioContext.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === "") return;

    setIsLoading(true);
    setError("");

    const newUserMessage: Message = { role: "user", content: inputText };
    setConversation(prev => [...prev, newUserMessage]);
    setInputText("");

    try {
      const chatGPTResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4-1106-preview",
          messages: [...conversation, newUserMessage],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const chatGPTText = chatGPTResponse.data.choices[0].message.content;
      setChatgptText(chatGPTText);

      const newAssistantMessage: Message = { role: "assistant", content: chatGPTText };
      setConversation(prev => [...prev, newAssistantMessage]);

      const elevenlabsResponse = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabs_voiceid}?output_format=pcm_16000`,
        {
          text: chatGPTText,
          model_id: "eleven_multilingual_v2",
          language_id: "korean",
        },
        {
          headers: {
            "xi-api-key": `${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      const pcm16Data = new Uint8Array(elevenlabsResponse.data);
      console.log(pcm16Data);

      const chunkSize = 6000;
      for (let i = 0; i < pcm16Data.length; i += chunkSize) {
        const chunk = pcm16Data.slice(i, i + chunkSize);
        simliClient.sendAudioData(chunk);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleConversation = () => {
    setShowConversation(!showConversation);
  };

  return (
    <div className="bg-black w-full h-svh flex flex-col justify-center items-center font-mono text-white">
      <div className="w-[512px] h-svh flex flex-col justify-center items-center gap-4">
        <div className="relative w-full aspect-video">
          <video
            ref={videoRef}
            id="simli_video"
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          ></video>
          <audio ref={audioRef} id="simli_audio" autoPlay></audio>
        </div>
        {startWebRTC ? (
          <>
            {chatgptText && <p>{chatgptText}</p>}
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your message"
                className="w-full px-3 py-2 border border-white bg-black text-white focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black py-2 px-4 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Send"}
              </button>
            </form>
            <button
              onClick={toggleConversation}
              className="w-full bg-gray-700 text-white py-2 px-4 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            >
              {showConversation ? "Hide Conversation" : "Show Conversation"}
            </button>
            {showConversation && (
              <div className="w-full mt-4 bg-gray-900 p-4 rounded-lg max-h-60 overflow-y-auto">
                {conversation.map((message, index) => (
                  <div key={index} className={`mb-2 ${message.role === "user" ? "text-blue-400" : "text-green-400"}`}>
                    <strong>{message.role === "user" ? "You: " : "Assistant: "}</strong>
                    {message.content}
                  </div>
                ))}
                <div ref={conversationEndRef} />
              </div>
            )}
          </>
        ) : (
          <button
            onClick={handleStart}
            className="w-full bg-white text-black py-2 px-4 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          >
            Start
          </button>
        )}
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default Demo;
