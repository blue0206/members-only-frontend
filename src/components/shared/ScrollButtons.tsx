import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ScrollButtons() {
  const [showButtons, setShowButtons] = useState<boolean>(false);
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);

  useEffect(() => {
    const scrollHandler = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setShowButtons(scrollTop > 100);

      setIsAtTop(scrollTop < 100);
      setIsAtBottom(scrollTop + windowHeight >= documentHeight - 100);
    };

    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!showButtons) return null;

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
