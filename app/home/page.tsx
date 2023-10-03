import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import InfiniteFeed from "@/components/InfiniteFeed";
import { BiSearch } from "react-icons/bi";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }
  const { data, error } = await supabase
    .from("tweets")
    .select("*, author: profiles(*), likes(*)")
    .order("created_at", { ascending: false });

  const tweets = data?.map((tweet: any) => ({
    ...tweet,
    user_has_liked: !!tweet.likes.find(
      (like: any) => like.user_id === user?.id
    ),
    likes: tweet.likes.length,
  }));

  const { data: followProfiles, error: followProfilesError } = await supabase
    .from("profiles")
    .select("*");

  // IMPORTANT:
  // ROUTING: - dynamic tweet page
  // /username/tweet/[tweetId]
  // CLICK ON REPLY:
  // /REPLYAUTHOR-USERNAME/tweet/[replyId]

  return (
    <>
      <div className="flex">
        <LeftSidebar user={user} />

        <InfiniteFeed user={user} tweets={tweets} />

        {/* right sidebar */}
        <div className="flex flex-col max-w-[350px] w-full mx-4">
          <div className="top-0 fixed py-2 flex flex-col max-w-[350px] w-full">
            <div className="group flex bg-[#16181C] rounded-full p-2  px-4 items-center space-x-3 border focus-within:bg-slate-950 focus-within:border-blue-500">
              <BiSearch className="group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search"
                className="bg-[#16181C] outline-none focus:bg-slate-950"
              />
            </div>
            <div className="flex flex-col bg-[#16181C] rounded-xl pt-2 mt-5">
              <h2 className="p-2 text-lg font-bold">Who to Follow</h2>
              {followProfiles.map((followProfile: any) => (
                <Link key={followProfile.id} href={`${followProfile.username}`}>
                  {/* lst:rounded-b-xl also applied to first element WHY ? :( */}
                  <div className="flex space-x-3 p-2 w-full justify-center hover:bg-white/10 transition duration-200 last:rounded-b-xl">
                    <div className="flex-none my-auto">
                      <Image
                        src={followProfile.avatar_url}
                        width={40}
                        height={40}
                        alt="Profile Image"
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex w-full justify-between">
                      <div className="flex flex-col w-full">
                        <h2 className="hover:underline transition duration-200">
                          {followProfile.name}
                        </h2>
                        <h2 className="text-gray-500">
                          @{followProfile.username}
                        </h2>
                      </div>
                      <div className="flex flex-col w-fit justify-center items-end">
                        <button className="rounded-full text-black font-medium bg-[#EFF3F4] px-4 py-1">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex flex-col bg-[#16181C] rounded-xl px-4 p-2 mt-5 space-y-4">
              <h2>Trending</h2>
              <div>Trend 1</div>
              <div>Trend 2</div>
              <div>Trend 3</div>
              <div>Trend 4</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
