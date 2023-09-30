import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ComposeTweet from "@/components/client-components/ComposeTweet";
import Tweet from "@/components/client-components/Tweet";
import Logout from "../auth/sign-out/Logout";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("tweets")
    .select("*, author: profiles(*), likes(*)");

  const tweets = data?.map((tweet) => ({
    ...tweet,
    author_has_liked: !!tweet.likes.find(
      (like: any) => like.user_id === user?.id
    ),
    likes: tweet.likes.length,
  }));

  if (!user) {
    redirect("/");
  }

  // IMPORTANT:
  // ROUTING: - dynamic tweet page
  // /username/tweet/[tweetId]
  // CLICK ON REPLY:
  // /REPLYAUTHOR-USERNAME/tweet/[replyId]

  const navigationList = [
    "Logo",
    "Home",
    "Explore",
    "Notifications",
    "Messages",
    "Lists ?",
    "Communities ?",
    "Bookmarks (favs)",
  ];

  return (
    <>
      <div className="flex">
        {/* left sidebar */}
        <div className="flex flex-col max-w-xl flex-grow items-end">
          <div className="top-0 fixed flex flex-col h-full justify-between px-2">
            <div className="flex flex-col text-xl">
              <div className="flex flex-col items-start my-4 mx-4 space-y-4">
                {navigationList.map((item) => (
                  <div className="px-4 rounded-full hover:bg-green-500 transition duration-200">
                    <Link href={`/${item.toLowerCase()}`}>{item}</Link>
                  </div>
                ))}
              </div>
              <button>Post</button>
            </div>
            <div className="self-center mb-2">
              <Logout />
            </div>
          </div>
        </div>

        {/* infinite tweets feed */}
        <div className="max-w-[600px] w-full h-full mx-0 border-l border-r">
          {/* TOP HEADER */}
          <div className="top-0 sticky flex border-b w-full backdrop-filter backdrop-blur-md bg-opacity-70 bg-slate-950">
            <div className="flex flex-col w-full">
              <h1 className="text-lg p-4 font-bold">Home</h1>
              <div className="flex flex-row">
                <div className="w-1/2 flex justify-center hover:bg-white/10">
                  <button className="border-blue-500 border-b-4 py-4">
                    For You
                  </button>
                </div>
                <div className="w-1/2 flex justify-center hover:bg-white/10">
                  <button className="hover:border-blue-500 border-transparent border-b-4 py-4">
                    Following
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* TOP HEADER */}
          <div className="flex flex-col items-center">
            <ComposeTweet user={user} />
            <h1>.</h1>
            <h1>.</h1>
            {tweets?.map((tweet) => (
              <Tweet key={tweet.id} user={user} tweet={tweet} />
            ))}
            <h1>-</h1>
            <h1>-</h1>
            <pre className="flex flex-wrap w-fit">
              {JSON.stringify(tweets, null, 2)}
            </pre>
          </div>
        </div>

        {/* right sidebar */}
        <div>
          <div className="top-0 fixed">some content</div>
        </div>
      </div>
    </>
  );
}
