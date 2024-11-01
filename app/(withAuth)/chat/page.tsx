"use client";

import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Paperclip } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { db, storage } from "@Lib/firebase";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import getAllUsers, { GetAllUsersResponse } from "@Lib/functions/getAllUsers";
import getChat, { ChatMessage } from "@Lib/functions/getChat";
import { AudioRecorder } from "react-audio-voice-recorder";
import Avatar from "react-avatar";
import { useAuthContext } from "@Contexts";
import createRoom from "@Lib/functions/createRoom";
import createMessage from "@Lib/functions/createMessage";
import { v4 as uuidv4 } from "uuid";

const ChatPage = () => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [allUsers, setAllUsers] = useState<GetAllUsersResponse[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user, logOut } = useAuthContext();

  useEffect(() => {
    (async () => {
      setAllUsers(await getAllUsers());
    })();
  }, []);

  const getActiveChat = useCallback(async () => {
    if (activeChat) {
      const data = await getChat({ person: activeChat });
      if (!data) {
        const id = uuidv4();
        await createRoom({ id, person: activeChat });
        setMessages([]);
        setActiveChatId(id);
      } else {
        setMessages(data.messages);
        setActiveChatId(data.id);
      }
    }
  }, [activeChat]);

  useEffect(() => {
    getActiveChat();
  }, [getActiveChat]);

  useEffect(() => {
    const q = query(collection(db, "room"), where("id", "==", activeChatId));
    const unsubscribe = onSnapshot(q, getActiveChat);
    return () => unsubscribe();
  }, [activeChatId, getActiveChat]);

  const uploadFile = async (file: File, fileType: "image" | "audio") => {
    if (!file || !activeChat) return;
    const storageRef = ref(storage, `rooms/${activeChatId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(
      ref(storage, `rooms/${activeChatId}/${file.name}`)
    );
    await createMessage({
      receiver: activeChat,
      content: url,
      id: uuidv4(),
      type: fileType,
    });
    getActiveChat();
  };

  const onRecordingComplete = (blob: Blob) => {
    const currentTime = new Date().getTime();
    const file = new File([blob], `audio-${currentTime}.webm`, {
      type: "audio/webm",
    });
    uploadFile(file, "audio");
  };

  const sendMessage = async () => {
    if (chatInputRef.current?.value && activeChat) {
      await createMessage({
        id: uuidv4(),
        content: chatInputRef.current.value,
        receiver: activeChat,
        type: "text",
      });
      chatInputRef.current.value = "";
      await getActiveChat();
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadFile(e.target.files[0], "image");
  };

  return (
    <div className="h-full grid grid-cols-12 gap-4 p-4">
      <div className="col-span-2 md:col-span-4">
        <div className="flex flex-col gap-y-4 h-full">
          {allUsers
            .filter(({ uid }) => uid !== user?.uid)
            .map(({ uid, displayName }) => (
              <div
                key={uid}
                onClick={() => { console.log('testing', uid); setActiveChat(uid)}}
                className={`border border-gray-200 rounded-lg shadow flex gap-x-4 items-center p-2 cursor-pointer ${
                  activeChat === uid
                    ? "bg-black text-white hover:bg-black"
                    : "bg-white hover:bg-slate-100"
                }`}
              >
                <Avatar name={displayName} size="48" round />
                <span className="hidden md:block">{displayName}</span>
              </div>
            ))}
          <Button className="mt-auto" onClick={logOut}>
            Logout
          </Button>
        </div>
      </div>
      <div className="col-span-10 md:col-span-8">
        <div className="flex flex-col h-full">
          {activeChat ? (
            <>
              <ChatMessageList>
                {messages.map(
                  ({ id, content, senderId, sender, type }) => (
                    <ChatBubble
                      key={id}
                      variant={senderId === user?.uid ? "sent" : "received"}
                    >
                      <Avatar
                        name={sender}
                        round
                        size="32"
                      />
                      <ChatBubbleMessage>
                        {type === "image" ? (
                          <img src={content} className="w-full h-auto" />
                        ) : type === "audio" ? (
                          <audio controls>
                            <source src={content} type="audio/webm" />
                          </audio>
                        ) : (
                          content
                        )}
                      </ChatBubbleMessage>
                    </ChatBubble>
                  )
                )}
              </ChatMessageList>
              <form className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1">
                <ChatInput
                  ref={chatInputRef}
                  placeholder="Type your message here..."
                  className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center p-3 pt-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => uploadRef.current?.click()}
                  >
                    <input
                      ref={uploadRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileChange}
                    />
                    <Paperclip className="size-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>

                  <Button variant="ghost" size="icon" type="button">
                    <AudioRecorder
                      onRecordingComplete={onRecordingComplete}
                      audioTrackConstraints={{
                        noiseSuppression: true,
                        echoCancellation: true,
                      }}
                      classes={{
                        AudioRecorderClass:
                          /*tw*/ "!bg-transparent !shadow-none !w-auto justify-center",
                        AudioRecorderStartSaveClass:
                          /*tw*/ "!rounded-none !size-4 !p-0",
                      }}
                    />
                    <span className="sr-only">Use Microphone</span>
                  </Button>

                  <Button
                    size="sm"
                    className="ml-auto gap-1.5"
                    type="button"
                    onClick={sendMessage}
                  >
                    Send Message
                    <CornerDownLeft className="size-3.5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <span className="m-auto text-2xl font-semibold">
              Choose chat to start
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
