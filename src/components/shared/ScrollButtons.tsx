import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

interface ScrollButtonsPropsType {
  topElementIntersectionEntry: IntersectionObserverEntry | null;
  bottomElementIntersectionEntry: IntersectionObserverEntry | null;
}

export default function ScrollButtons({
  topElementIntersectionEntry,
  bottomElementIntersectionEntry,
}: ScrollButtonsPropsType) {
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

  // Checks if the topmost message and the bottommost message are visible
  // to the user and sets the isAtTop and isAtBottom states accordingly.
  useEffect(() => {
    if (typeof topElementIntersectionEntry?.isIntersecting === "boolean") {
      setIsAtTop(topElementIntersectionEntry.isIntersecting);
    }

    if (typeof bottomElementIntersectionEntry?.isIntersecting === "boolean") {
      setIsAtBottom(bottomElementIntersectionEntry.isIntersecting);
    }
  }, [
    topElementIntersectionEntry?.isIntersecting,
    bottomElementIntersectionEntry?.isIntersecting,
  ]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="fixed top-20 left-0 right-0 z-40 flex justify-center pointer-events-none">
        {!isAtTop && (
          <Button
            size={"icon"}
            className="h-11 w-11 rounded-full shadow-lg pointer-events-auto cursor-pointer"
            onClick={scrollToTop}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="fixed bottom-56 left-0 right-0 z-50 flex justify-center pointer-events-none">
        {!isAtBottom && (
          <Button
            size={"icon"}
            className="h-11 w-11 rounded-full shadow-lg pointer-events-auto cursor-pointer"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        )}
      </div>
    </>
  );
}
