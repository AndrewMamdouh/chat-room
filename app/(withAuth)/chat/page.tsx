"use client";

import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";

import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Mic, Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { storage } from "@Lib/firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

const messages = [
  {
    id: 1,
    message: "Hello, how has your day been? I hope you are doing well.",
    sender: "user",
  },
  {
    id: 2,
    message:
      "Hi, I am doing well, thank you for asking. How can I help you today?",
    sender: "bot",
  },
];

const users = [
  {
    id: 1,
    displayName: "Ahmed Shokry",
    initials: "AS",
  },
  {
    id: 2,
    displayName: "Andrew Mamdouh",
    initials: "AM",
  },
  {
    id: 3,
    displayName: "Ali Khaled",
    initials: "AK",
  },
];

const ChatPage = () => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const uploadFile = (file: File) => {
    if (!file) return;
    const storageRef = ref(storage, `files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadPercentage(progress);
      },
      (error) => {
        alert(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log(downloadURL);
        });
      }
    );
  };

  return (
    <div className="h-full grid grid-cols-12 gap-4 p-4">
      <div className="col-span-4">
        <div className="flex flex-col gap-y-4 h-full">
          {users.map(({ id, displayName, initials }) => (
            <div
              key={id}
              className=" bg-white border border-gray-200 rounded-lg shadow flex gap-x-4 items-center p-2 cursor-pointer hover:bg-slate-100"
            >
              <ChatBubbleAvatar fallback={initials} />
              <span>{displayName}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-8">
        <div className="flex flex-col h-full justify-between">
          <ChatMessageList>
            {messages.map((message) => {
              const variant = message.sender === "user" ? "sent" : "received";
              return (
                <ChatBubble key={message.id} variant={variant}>
                  <ChatBubbleAvatar
                    fallback={variant === "sent" ? "US" : "AI"}
                  />
                  <ChatBubbleMessage>{message.message}</ChatBubbleMessage>
                </ChatBubble>
              );
            })}
          </ChatMessageList>
          <form className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1">
            <ChatInput
              placeholder="Type your message here..."
              className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0">
              <Button variant="ghost" size="icon" type="button" onClick={() => uploadRef.current?.click()}>
                  <input ref={uploadRef} type="file" className="hidden" />
                  <Paperclip className="size-4" />
                  <span className="sr-only">Attach file</span>
              </Button>

              <Button variant="ghost" size="icon" type="button">
                <Mic className="size-4" />
                <span className="sr-only">Use Microphone</span>
              </Button>

              <Button size="sm" className="ml-auto gap-1.5" type="button">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
