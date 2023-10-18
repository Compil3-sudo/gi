import ArrowHeader, {
  FollowersTabs,
} from "@/components/client-components/ArrowHeader";
import WhoToFollowProfile from "@/components/client-components/WhoToFollowProfile";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const ProfileCommonFollowers = async ({
  params,
}: {
  params: { username: string };
}) => {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user: currentUser },
    error: userError,
  } = await supabase.auth.getUser();

  // user must be logged in to see profile pages
  if (!currentUser) redirect("/");

  if (params.username === currentUser?.user_metadata.user_name) {
    redirect(`/${params.username}`);
  }

  const { data: currentUserProfile, error: currentUserProfileError } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();

  if (!currentUserProfile) redirect("/");

  const { data: userProfile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  if (error) console.log(error);
  if (!userProfile) redirect(`/${params.username}`);

  const { data: followers, error: followersError } = await supabase
    .from("followers")
    .select("*")
    .eq("followed_id", userProfile.id);

  const ownProfile = currentUserProfile.username === userProfile.username;

  let commonFollowersIds = [] as Profile["id"][];
  let commonFollowers = [] as Profile[];

  if (!ownProfile) {
    // who is the current user following
    const { data: userFollowing, error: userFollowingError } = await supabase
      .from("followers")
      .select("followed_id")
      .eq("follower_id", currentUserProfile.id);

    // determine whether the userProfile is being followed
    // by people who the current user is also following
    const userProfileFollowers =
      followers?.map((follower) => follower.follower_id) || [];
    const userFollowingIds =
      userFollowing?.map((following) => following.followed_id) || [];

    // find common followers
    commonFollowersIds = userProfileFollowers.filter((followerId) =>
      userFollowingIds.includes(followerId)
    );

    const { data: commonFollowersData, error: commonFollowersError } =
      await supabase.from("profiles").select("*").in("id", commonFollowersIds);

    if (commonFollowersData) commonFollowers = commonFollowersData;
  }

  return (
    <>
      <ArrowHeader
        title={userProfile.name}
        subtitle={userProfile.username}
        ownProfile={ownProfile}
        followersTabs={true}
        followersActiveTab={"Followers you know"}
        // followersActiveTab={FollowersTabs[0]}
      />
      {commonFollowersIds.length === 0 ? (
        <>
          <div>
            <h1>
              @{userProfile.username} doesn't have any followers you know yet
            </h1>
            <h2>When someone you know follows them, they'll be listed here.</h2>
          </div>
        </>
      ) : (
        commonFollowers.map((profile) => (
          <WhoToFollowProfile
            key={profile.id}
            userId={currentUserProfile.id}
            followProfile={profile}
            isUserFollowingProfile={true}
            showBio={true}
          />
        ))
      )}
    </>
  );
};

export default ProfileCommonFollowers;