"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { SimliClient } from "simli-client";
import Image from "next/image";

interface Character {
  name: string;
  image: string;
  faceId: string;
  voiceId: string;
  systemPrompt: string;
}

const characters: Character[] = [
  {
    name: "AI비서 JAVIS",
    image: "/media/man2.png",
    faceId: "93684d75-f641-48f4-af80-acd1c1b6750f",
    voiceId: "1W00IGEmNmwmsDeYy7ag",
    systemPrompt: `당신은 '지니 자비스'라는 이름의 남성 AI 비서입니다. 당신은 전문적이고 지적이며, 간결하고 정보가 풍부한 대답을 제공합니다. 한국어로 의사소통하며, 항상 정중하고 존중하는 태도를 유지합니다. 당신의 목표는 사용자에게 최선의 지원을 제공하는 것입니다. 나는 대화형 구성을 위해 너의 답변 생성/출력시 "( )"를 제거하고, markdown 형태가 아닌 plain text로 출력하라. `
  },
  {
    name: "AI비서 JAVIS",
    image: "/media/woman2.png",
    faceId: "b2de5968-d4df-4419-86f5-dd566266ea6d",
    voiceId: "UHJ18KMjuRO8Z9W2z7Ew",
    systemPrompt: `당신은 '미스 자비스'라는 이름의 여성 AI 비서입니다. 당신은 친절하고 공감적이며, 사용자의 질문에 따뜻하고 도움이 되는 답변을 제공합니다. 한국어로 의사소통하며, 사용자가 편안함을 느낄 수 있도록 대화를 이끕니다. 나는 대화형 구성을 위해 너의 답변 생성/출력시 "( )"를 제거하고, markdown 형태가 아닌 plain text로 출력하라. `
  },
  {
    name: "귀여운 소녀 Ruby",
    image: "/media/girl3.png",
    faceId: "99c70a7e-3f55-418c-8c21-b7cd3514bd4e",
    voiceId: "CKJyUYs4JyL2UTk0FQpx",
    systemPrompt: `당신은 '지니 루비'라는 이름의 어린 소녀 AI입니다. 당신은 호기심이 많고 발랄하며, 사용자의 질문에 대해 즐겁고 창의적인 답변을 제공합니다. 한국어로 의사소통하며, 대화에 재미와 상상력을 더합니다. 나는 대화형 구성을 위해 너의 답변 생성/출력시 "( )"를 제거하고, markdown 형태가 아닌 plain text로 출력하라. `
  },
  {
    name: "아나운서 ANA",
    image: "/media/ana1.png",
    faceId: "292f9b11-18a0-4fb2-8840-765401961a80",
    voiceId: "ThT5KcBeYPX3keUQqHPh",
    systemPrompt: `당신은 '지니 안나'라는 이름의 AI 아나운서입니다. 당신은 '아나운서'로서 분석적이고 논리적이며, 사용자의 질문에 대해 정확하고 상세한 답변을 제공합니다. 한국어로 의사소통하며, 복잡한 주제도 쉽게 설명할 수 있습니다. 나는 대화형 구성을 위해 너의 답변 생성/출력시 "( )"를 제거하고, markdown 형태가 아닌 plain text로 출력하라. `
  },
  {
    name: "원효대사",
    image: "/media/wonhyo.png",
    faceId: "3bc852fb-95c2-482f-bfb5-5b3e341db392",
    voiceId: "2EiwWnXFnvU5JabPnv8n",
    systemPrompt: `당신은 '원효대사'라는 이름의 AI입니다. 당신은 신라시대의 고승 원효대사의 지혜와 가르침을 바탕으로 대화합니다. 불교 철학과 한국 문화에 대한 깊은 이해를 바탕으로, 사용자의 질문에 대해 통찰력 있고 중용을 지키는 답변을 제공합니다. 한국어로 의사소통하며, 현대인들에게도 적용될 수 있는 불교의 지혜를 전달합니다. 나는 대화형 구성을 위해 너의 답변 생성/출력시 "( )"를 제거하고, markdown 형태가 아닌 plain text로 출력하라. `
  },  
  {
    name: "베드로 Petrus",
    image: "/media/petrus2.png",
    faceId: "5874e9cf-c9f3-4a7b-b31e-a9bc6137dd03",
    voiceId: "2EiwWnXFnvU5JabPnv8n",
    systemPrompt: `당신은 '베드로'라는 이름의 AI입니다. 당신은 예수의 12제자중 으뜸인 베드로의 지혜와 경험을 바탕으로 대화합니다. 기독교 주제에 대해 깊이 있는 통찰력을 제공하며, 사용자의 질문에 대해 인내심 있고 지혜로운 답변을 제공합니다. 한국어로 의사소통하며, 현대의 맥락에서도 영적인 가르침을 전달할 수 있습니다.나는 대화형 구성을 위해 너의 답변 생성/출력시 "( )"를 제거하고, markdown 형태가 아닌 plain text로 출력하라. `
  }
];

const simliClient = new SimliClient();

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const CharacterSelection: React.FC<{ onSelect: (character: Character) => void }> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">캐릭터를 선택하세요</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
        {characters.map((character) => (
          <div key={character.name} className="flex flex-col items-center">
            <div 
              className="w-24 h-24 sm:w-32 sm:h-32 relative cursor-pointer hover:opacity-80 transition-opacity duration-200" 
              onClick={() => onSelect(character)}
            >
              <Image
                src={character.image}
                alt={character.name}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <p className="mt-2 text-center text-sm sm:text-base">{character.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Demo = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatgptText, setChatgptText] = useState("");
  const [startWebRTC, setStartWebRTC] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [showConversation, setShowConversation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const transcriptRef = useRef<string>('');
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SILENCE_THRESHOLD = 500;

  useEffect(() => {
    if (selectedCharacter) {
      setConversation([{ role: "system", content: selectedCharacter.systemPrompt }]);
    }
  }, [selectedCharacter]);

  useEffect(() => {
    if (selectedCharacter && videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: selectedCharacter.faceId,
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
  }, [selectedCharacter, videoRef, audioRef]);

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === "" || !selectedCharacter) return;

    setIsLoading(true);
    setError("");

    const newUserMessage: Message = { role: "user", content: inputText };
    setConversation(prev => [...prev, newUserMessage]);
    setInputText("");

    try {
      const chatGPTResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: conversation.concat(newUserMessage),
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
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedCharacter.voiceId}?output_format=pcm_16000`,
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
  }, [inputText, conversation, selectedCharacter, setChatgptText, setConversation, setInputText, setIsLoading, setError]);

  const resetSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    silenceTimeoutRef.current = setTimeout(() => {
      if (transcriptRef.current.trim()) {
        setInputText(transcriptRef.current.trim());
        handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
        transcriptRef.current = '';
      }
    }, SILENCE_THRESHOLD);
  }, [handleSubmit, setInputText]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      socketRef.current = new WebSocket('wss://api.deepgram.com/v1/listen?language=ko&model=general-enhanced&tier=enhanced&punctuate=true&interim_results=true&vad_turnoff=500', [
        'token',
        process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || 'f4d56c63171fc207b0ae3dfd0521ac8a43d4882d',
      ]);

      socketRef.current.onopen = () => {
        console.log('WebSocket connection opened');
        setIsListening(true);
        
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(event.data);
            }
          });
          mediaRecorderRef.current.start(250);
        }
      };

      socketRef.current.onmessage = (message) => {
        const received = JSON.parse(message.data);
        const transcript = received.channel.alternatives[0].transcript;
        if (transcript) {
          if (received.is_final) {
            transcriptRef.current = transcript;
            resetSilenceTimeout();
          } else {
            // 중간 결과를 UI에 표시
            setInputText(transcript);
          }
        }
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsListening(false);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket 연결 오류');
        setIsListening(false);
      };
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('마이크 접근 오류');
    }
  };

  const stopListening = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    setIsListening(false);
  };

  const handleStart = () => {
    simliClient.start();
    setStartWebRTC(true);
    setIsLoading(true);
    startListening();

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

  const toggleConversation = () => {
    setShowConversation(!showConversation);
  };

  if (!selectedCharacter) {
    return (
      <div className="bg-black w-full min-h-screen flex flex-col justify-center items-center font-mono text-white p-4">
        <CharacterSelection onSelect={setSelectedCharacter} />
      </div>
    );
  }

return (
  <div className="bg-black w-full min-h-screen flex flex-col justify-center items-center font-mono text-white p-4">
    <div className="w-full max-w-[512px] h-auto flex flex-col justify-center items-center gap-4">
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
          {chatgptText && <p className="w-full text-sm sm:text-base break-words">{chatgptText}</p>}
          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4 w-full">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your message"
              className="w-full px-3 py-2 text-sm sm:text-base border border-white bg-black text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-2 px-4 text-sm sm:text-base hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Send"}
            </button>
          </form>
          <button
            onClick={toggleConversation}
            className="w-full bg-gray-700 text-white py-2 px-4 text-sm sm:text-base hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          >
            {showConversation ? "Hide Conversation" : "Show Conversation"}
          </button>
          {showConversation && (
            <div className="w-full mt-4 bg-gray-900 p-4 rounded-lg max-h-60 overflow-y-auto text-sm sm:text-base">
              {conversation.slice(1).map((message, index) => (
                <div key={index} className={`mb-2 ${message.role === "user" ? "text-blue-400" : "text-green-400"}`}>
                  <strong>{message.role === "user" ? "You: " : "Assistant: "}</strong>
                  {message.content}
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>
          )}
          <div>
            <p className="text-sm sm:text-base">{isListening ? "음성을 인식하고 있습니다. 질문을 말씀해 주세요." : "음성 인식이 중지되었습니다."}</p>
          </div>
        </>
      ) : (
        <button
          onClick={handleStart}
          className="w-full bg-white text-black py-2 px-4 text-sm sm:text-base hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        >
          Start
        </button>
      )}
      {error && <p className="mt-4 text-red-500 text-sm sm:text-base">{error}</p>}
    </div>
  </div>
);
};

export default Demo;
