import { useAppSelector } from "@/app/hooks";
import { Header } from "@/components/layout";
import { isAuthenticated } from "../auth/authSlice";
import {
  useGetMessagesWithAuthorQuery,
  useGetMessagesWithoutAuthorQuery,
} from "@/app/services/messageApi";
import Message from "./Message";

// Messages Without Author Component
function MessagesWithAuthor() {
  const { data, isSuccess } = useGetMessagesWithAuthorQuery();

  return (
    <>
      {isSuccess &&
        data.map((message) => <Message key={message.messageId} {...message} />)}
    </>
  );
}

// Messages With Author Component
function MessagesWithoutAuthor() {
  const { data, isSuccess } = useGetMessagesWithoutAuthorQuery();

  return (
    <>
      {isSuccess &&
        data.map((message) => <Message key={message.messageId} {...message} />)}
    </>
  );
}

export default function Home() {
  const isAuth = useAppSelector(isAuthenticated);

  return (
    <div className="w-screen h-screen">
      <Header />
      <div className="w-full">
        <div className="container max-w-2xl px-4 md:max-w-4xl py-11 mx-auto">
          {isAuth ? <MessagesWithAuthor /> : <MessagesWithoutAuthor />}
        </div>
      </div>
    </div>
  );
}
