import Image from "next/image";
import SongTile from "../../components/SongTile";
import SideBar from "../../components/SideBar";

import {getServerSession} from "next-auth/next";
import {authOptions, db} from "./../api/auth/[...nextauth]";
import {GetServerSideProps} from "next";
import {ProfileStatistics, SongMetadata, ProfileTopReviews} from "@/types";
import Spinner from "@/components/Spinner";
import {User} from "@/types";
import ReviewTile from "@/components/ReviewTile";
import {AccountJoinTimestamp} from "@/dates";
import Head from "next/head";
import clsx from "clsx";
import spotifyApi from "../api/spotify/wrapper";
import {useEffect} from "react";

export default ({
    user,
    userId,
    sideStatistics,
    reviews,
    favoriteSongs,
    pinnedSongs
}: {
    user: User;
    userId: string;
    sideStatistics: ProfileStatistics;
    reviews: ProfileTopReviews[];
    favoriteSongs: SongMetadata[];
    pinnedSongs: SongMetadata[];
}): JSX.Element => {
    const isOwnProfile = user.id === userId;

    return (
        <>
            <Head>
                <title>Songscope - Profile</title>
            </Head>
            <div className="flex flex-row h-full">
                <SideBar
                    variant={"profile"}
                    user={user}
                    favoriteSongs={favoriteSongs}
                    showFavoriteSongs={user.show_favorite_songs}
                    isOwnProfile={isOwnProfile}
                    // Top and Hot Songs are not rendered in the sidebar for the profile page
                    topSongs={[]}
                    hotSongs={[]}
                />
                <div className="w-4/5 sm:w-5/6 h-screen overflow-auto">
                    <div className="pt-8 px-8">
                        {user ? (
                            <>
                                <div className="flex flex-row space-x-4">
                                    <div className="flex flex-col space-y-2 w-1/6">
                                        <Image
                                            src={user.image || "/default-profile.jpg"}
                                            width={225}
                                            height={225}
                                            className="border border-accent-neutral/30 rounded-xl"
                                            alt="Profile Picture"
                                        ></Image>
                                        <div className="flex flex-row space-x-2">
                                            {/* <div className="w-5 h-5 rounded-2xl bg-lime-400 mb-auto"></div> */}
                                        </div>
                                    </div>
                                    <div className="w-1/2 sm:w-4/6 text-lg flex flex-col place-content-between">
                                        <div>
                                            <h1 className="font-bold text-2xl mx-auto">
                                                {user.name}
                                            </h1>
                                            {/* TODO --> Improve placeholder */}
                                            <h3 className="text-text/90">
                                                {user.bio || "No bio yet!"}
                                            </h3>
                                        </div>
                                        <h3 className="text-text/50 italic font-light sm:pb-1">
                                            Scoping out songs since:{" "}
                                            {AccountJoinTimestamp(user.join_date)}
                                        </h3>
                                    </div>
                                    <div className="border-l-2 border-l-accent-neutral/20 pl-6 w-2/6 sm:w-1/6">
                                        <h1 className="mr-auto font-semibold text-xl pb-3">
                                            Lifetime Stats
                                        </h1>
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex flex-row space-x-4">
                                                <div className="flex flex-col italic space-y-2">
                                                    {sideStatistics ? (
                                                        <>
                                                            <h3>
                                                                Total Comments:{" "}
                                                                {sideStatistics.total_comments}
                                                            </h3>
                                                            <h3>
                                                                Total Favorites:{" "}
                                                                {sideStatistics.total_favorites}
                                                            </h3>
                                                            {/* TODO --> Figure out some nicer fallback for no rating... */}
                                                            <h3>
                                                                Average Rating:{" "}
                                                                {sideStatistics.avg_rating
                                                                    ? sideStatistics.avg_rating.toFixed(
                                                                          2
                                                                      )
                                                                    : "N/A"}
                                                            </h3>
                                                        </>
                                                    ) : (
                                                        <Spinner />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr className="w-7/8 mr-auto border-t-2 my-6 border-secondary"></hr>
                                <div className="my-auto">
                                    <h2 className="text-2xl pl-2 font-bold">Pinned Songs</h2>
                                    <div className="flex flex-row w-full mx-auto place-content-between pt-5">
                                        {pinnedSongs ? (
                                            pinnedSongs.length ? (
                                                // TODO --> Fix this, bandaid solution to only show 3 pinned songs (better for display purposes)
                                                pinnedSongs
                                                    .slice(0, 3)
                                                    .map((song) => (
                                                        <SongTile
                                                            key={song.id}
                                                            rating={song.avg_rating}
                                                            metadata={song}
                                                            user={user}
                                                        />
                                                    ))
                                            ) : (
                                                <div className="w-full flex place-content-center h-72">
                                                    <h3 className="text-text/50 italic m-auto">
                                                        No pinned songs yet!
                                                    </h3>
                                                </div>
                                            )
                                        ) : (
                                            <div className="h-80 flex place-content-center mx-auto">
                                                <Spinner />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isOwnProfile || user.show_reviews ? (
                                    <div className="pt-5">
                                        <h2 className="text-2xl pl-2 font-bold">
                                            Top Reviews
                                            <p
                                                className={clsx(
                                                    "text-text/70 text-md font-light pt-2",
                                                    !user.show_reviews && "hidden"
                                                )}
                                            >
                                                <a href="/settings">
                                                    {" "}
                                                    {isOwnProfile &&
                                                        !user.show_reviews &&
                                                        "This section is only visible to you"}
                                                </a>
                                            </p>
                                        </h2>
                                        <div className="flex flex-row w-full mx-auto place-content-evenly pt-1">
                                            {reviews?.length ? (
                                                reviews.map((review) => (
                                                    <ReviewTile
                                                        key={review.comment_id}
                                                        profileReview={review}
                                                    />
                                                ))
                                            ) : (
                                                <div className="w-full flex place-content-center h-80">
                                                    <h3 className="text-text/50 italic m-auto">
                                                        No reviews yet!
                                                    </h3>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </>
                        ) : (
                            <Spinner />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    if (!ctx.params || !ctx.params.userId || typeof ctx.params.userId !== "string") {
        // 404 if no user id is provided or if malformed
        return {
            redirect: {
                destination: "/404",
                permanent: false
            }
        };
    }
    // @ts-expect-error
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

    if (!session) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        };
    }
    const dbResponse = await db.promise().query(
        `
SELECT u.*,
       JSON_ARRAYAGG(
               JSON_OBJECT(
                       'id', us.spotify_work_id,
                       'rating', us.rating
               )
       )                                                                      AS favoriteSongs,
       JSON_ARRAYAGG(
               JSON_OBJECT(
                       'id', usp.spotify_work_id,
                       'rating', usp.rating
               )
       )                                                                      AS pinnedSongs,
       (SELECT COUNT(*) FROM comment WHERE user_id = u.id)                    AS total_comments,
       (SELECT COUNT(*) FROM user_song WHERE favorite = 1 AND user_id = u.id) AS total_favorites,
       (SELECT AVG(rating) FROM user_song WHERE user_id = u.id)               AS avg_rating,
       (SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                               'user_id', u.id,
                               'comment_id', c.id,
                               'spotify_work_id', c.spotify_work_id,
                               'comment_text', c.comment_text,
                               'time', c.time,
                               'num_likes', (SELECT CAST(COALESCE(SUM(liked), 0) AS UNSIGNED)
                                             FROM user_comment uc
                                             WHERE uc.comment_id = c.id)
                       )
               )
        FROM comment c
        WHERE c.user_id = u.id
        LIMIT 3)                                                              AS top_reviews
FROM users u
         LEFT JOIN
     user_song us ON u.id = us.user_id AND us.favorite = 1
         LEFT JOIN
     user_song usp ON u.id = usp.user_id AND usp.pinned = 1
WHERE u.id = ?
GROUP BY u.id;
    `,
        [ctx.params.userId]
    );

    const dbResponseAny = (dbResponse as any)[0][0];
    const favoriteSongs: SongMetadata[] = dbResponseAny.favoriteSongs;
    const pinnedSongs: SongMetadata[] = dbResponseAny.pinnedSongs;
    let spotifyIds: string[] = [];
    for (let index = 0; index < favoriteSongs.length; ) {
        if (favoriteSongs[index].id) {
            spotifyIds.push(favoriteSongs[index].id);
            index++;
        } else {
            favoriteSongs.splice(index, 1);
        }
    }
    for (let index = 0; index < pinnedSongs.length; ) {
        if (pinnedSongs[index].id) {
            spotifyIds.push(pinnedSongs[index].id);
            index++;
        } else {
            pinnedSongs.splice(index, 1);
        }
    }

    if (spotifyIds.length > 0) {
        let spotifyResponseArray: SongMetadata[] = await spotifyApi.getMultipleSongs(spotifyIds, session.user);
        let spotifyResponse: any = {};
        for (let a = 0; a < spotifyResponseArray.length; ++a) {
            spotifyResponse[spotifyResponseArray[a].id] = spotifyResponseArray[a];
        }
        for (let index = 0; index < favoriteSongs.length || index < pinnedSongs.length; ++index) {
            if (index < favoriteSongs.length) {
                favoriteSongs[index] = spotifyResponse[favoriteSongs[index].id];
            }
            if (index < pinnedSongs.length) {
                pinnedSongs[index] = spotifyResponse[pinnedSongs[index].id];
            }
        }
    }

    return {
        props: {
            favoriteSongs,
            pinnedSongs,
            sideStatistics: {
                total_comments: dbResponseAny.total_comments,
                total_favorites: dbResponseAny.total_favorites,
                avg_rating: dbResponseAny.avg_rating
            },
            reviews: dbResponseAny.top_reviews || [],
            userId: ctx.params.userId,
            user: session.user
        }
    };
};
