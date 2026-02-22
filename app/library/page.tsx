"use client";

import { useRouter } from "next/navigation";
import { useConversation } from "@/hooks/use-conversation";
import { MainNavigation } from "@/components/MainNavigation";

interface ArchiveCardProps {
  title: string;
  date: string;
  hasImage?: boolean;
  type?: "chart" | "image" | "text";
  onClick: () => void;
}

function ArchiveCard({
  title,
  date,
  hasImage,
  type,
  onClick,
}: ArchiveCardProps) {
  return (
    <div onClick={onClick} className="group cursor-pointer flex flex-col gap-3">
      <div className="relative aspect-[1/1.41] bg-white dark:bg-[#252423] rounded-lg shadow-sm border border-primary/5 dark:border-white/10 overflow-hidden transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
        <div className="p-8 flex flex-col gap-4 opacity-60 dark:opacity-40">
          <div className="h-4 w-3/4 bg-primary/10 dark:bg-white/20 rounded-sm"></div>
          {hasImage && (
            <div className="mt-2 aspect-video w-full bg-primary/5 dark:bg-white/5 rounded-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-primary/10 text-4xl">
                image
              </span>
            </div>
          )}
          {type === "chart" && (
            <div className="h-32 w-full bg-primary/5 dark:bg-white/5 rounded-sm flex items-end justify-between px-2 pb-2 gap-1 mt-4">
              <div className="w-full bg-primary/10 dark:bg-white/10 h-[40%] rounded-t-sm"></div>
              <div className="w-full bg-primary/10 dark:bg-white/10 h-[60%] rounded-t-sm"></div>
              <div className="w-full bg-primary/10 dark:bg-white/10 h-[30%] rounded-t-sm"></div>
              <div className="w-full bg-primary/10 dark:bg-white/10 h-[80%] rounded-t-sm"></div>
            </div>
          )}
          <div className="space-y-2 mt-2">
            <div className="h-1.5 w-full bg-primary/5 dark:bg-white/10 rounded-sm"></div>
            <div className="h-1.5 w-full bg-primary/5 dark:bg-white/10 rounded-sm"></div>
            <div className="h-1.5 w-5/6 bg-primary/5 dark:bg-white/10 rounded-sm"></div>
          </div>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button className="bg-white dark:bg-[#333] hover:bg-primary/5 dark:hover:bg-white/20 text-primary dark:text-white rounded-full p-1.5 shadow-sm border border-primary/10">
            <span className="material-symbols-outlined text-[18px]">
              more_horiz
            </span>
          </button>
        </div>
      </div>
      <div className="px-1">
        <h3 className="text-lg font-bold text-primary dark:text-gray-100 leading-tight group-hover:text-primary/80 dark:group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-sm text-primary/40 dark:text-white/40 mt-1 font-medium">
          {date}
        </p>
      </div>
    </div>
  );
}


export default function LibraryPage() {
  const router = useRouter();
  const conversation = useConversation();

  // Debug logging
  console.log("Library page - conversations:", conversation.conversations);
  console.log("Library page - conversations length:", conversation.conversations.length);

  const handleCardClick = (conversationId?: string) => {
    if (conversationId) {
      conversation.setCurrentConversation(conversationId);
    }
    router.push("/workspace");
  };

  const getRelativeDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = diff / (1000 * 60 * 60);
    const days = diff / (1000 * 60 * 60 * 24);

    if (hours < 24) {
      return hours < 1
        ? "Modified just now"
        : `Modified ${Math.floor(hours)}h ago`;
    } else if (days < 2) {
      return "Modified yesterday";
    } else if (days < 30) {
      return `Modified ${Math.floor(days)} days ago`;
    } else {
      return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="bg-vellum dark:bg-background-dark text-primary dark:text-gray-100 min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-grain mix-blend-overlay"></div>
      <div className="relative z-10 flex flex-col min-h-screen pb-24">
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-vellum/80 dark:bg-background-dark/80 border-b border-primary/5 dark:border-white/10 px-6 py-4">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-primary dark:text-white shrink-0">
              <div className="size-8 flex items-center justify-center bg-primary text-white rounded-lg">
                <span className="material-symbols-outlined text-xl">
                  library_books
                </span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight hidden md:block">
                The Archive Library
              </h1>
            </div>
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary/40 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    search
                  </span>
                </div>
                <input
                  className="block w-full p-2.5 pl-10 text-base bg-white/50 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-primary dark:text-white transition-all shadow-sm hover:bg-white/80 dark:hover:bg-white/10"
                  placeholder="Search archives..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={() => router.push("/templates")}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                <span>New Draft</span>
              </button>
              <div className="size-9 rounded-full bg-primary/10 border border-primary/10 shadow-sm cursor-pointer flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  person
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex items-end justify-between mb-8 px-2">
            <div>
              <h2 className="text-3xl font-medium text-primary dark:text-white mb-1">
                Recent Projects
              </h2>
              <p className="text-primary/50 dark:text-white/50 text-base">
                Your collection of documents and briefs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10 pb-12">
            {conversation.conversations.length > 0 && (
              <>
                {conversation.conversations
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((conv, idx) => (
                    <ArchiveCard
                      key={conv.id}
                      title={conv.title}
                      date={getRelativeDate(conv.updatedAt)}
                      hasImage={idx % 3 === 0}
                      type={idx % 4 === 0 ? "chart" : undefined}
                      onClick={() => handleCardClick(conv.id)}
                    />
                  ))}
                <div
                  onClick={() => router.push("/templates")}
                  className="group cursor-pointer flex flex-col gap-3"
                >
                  <div className="relative aspect-[1/1.41] bg-white/50 dark:bg-white/5 rounded-lg shadow-sm border-2 border-dashed border-primary/20 dark:border-white/20 overflow-hidden transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:border-primary/40 flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-5xl text-primary/20 dark:text-white/20 mb-2">
                        add_circle
                      </span>
                      <p className="text-sm text-primary/40 dark:text-white/40 font-medium">
                        Create New
                      </p>
                    </div>
                  </div>
                  <div className="px-1">
                    <h3 className="text-lg font-bold text-primary/60 dark:text-gray-400 leading-tight">
                      New Document
                    </h3>
                    <p className="text-sm text-primary/40 dark:text-white/40 mt-1 font-medium">
                      Start fresh
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <MainNavigation />
    </div>
  );
}
