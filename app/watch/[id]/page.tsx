import { Metadata } from "next";
import VideoWatch from "@/components/video-watch";
import { cleanTitleFromFilename, getSiteUrl, getSocialImageUrl } from "@/lib/utils";
import { getMergedVideo } from "@/lib/videos";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let video = null;
  try {
    video = await getMergedVideo(id);
  } catch (error) {
    console.error("Error fetching video for metadata:", error);
  }

  if (!video) {
    return {
      title: "Video Not Found - Foursquare Gospel Church Nigeria Media Archive",
      description: "The requested video could not be found.",
    };
  }

  const title = video.meta?.title || cleanTitleFromFilename(video.name, video.meta?.category);
  const description =
    video.meta?.description_markdown ||
    `Watch "${title}" from the Foursquare Gospel Church Nigeria media archive.`;
  const imageUrl = getSocialImageUrl(video.meta?.thumbnail_url || video.thumbnailLink);
  const url = `${getSiteUrl()}/watch/${video.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "video.other",
      siteName: "Foursquare Gospel Church Nigeria Media Archive",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1280,
              height: 720,
              alt: title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VideoWatch videoId={id} />;
}