export interface ExtractedSocialMetadata {
  url: string;
  platform: "tiktok" | "instagram" | "youtube" | "custom";
  title: string;
  author: string;
  caption: string;
  tags: string[];
  rawText: string;
  extractedSuccessfully: boolean;
  youtubeWatchUrl?: string;
  mediaInline?: {
    mimeType: string;
    data: string; // base64
  };
  mediaInlineList?: Array<{
    mimeType: string;
    data: string; // base64
  }>;
}

export function detectPlatform(
  url: string
): "tiktok" | "instagram" | "youtube" | "custom" {
  const lower = url.toLowerCase();
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("instagram.com") || lower.includes("instagr.am"))
    return "instagram";
  if (lower.includes("youtube.com") || lower.includes("youtu.be"))
    return "youtube";
  return "custom";
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, "/")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

async function fetchMediaAsBase64(
  mediaUrl: string,
  defaultMimeType: string,
  referer = "https://www.instagram.com/",
  maxBytes = 18 * 1024 * 1024
): Promise<{ mimeType: string; data: string } | undefined> {
  try {
    const res = await fetch(mediaUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: referer,
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return undefined;

    const contentLength = Number(res.headers.get("content-length") || "0");
    if (contentLength > maxBytes) return undefined;

    const contentType =
      res.headers.get("content-type")?.split(";")[0]?.trim() ||
      defaultMimeType;

    // Avoid passing raw MP3 audio streams when a video/image is expected
    if (
      defaultMimeType.startsWith("video/") &&
      contentType.startsWith("audio/")
    ) {
      return undefined;
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > maxBytes || arrayBuffer.byteLength < 500) {
      return undefined;
    }

    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return { mimeType: contentType, data: base64 };
  } catch {
    return undefined;
  }
}

export async function extractSocialMetadata(
  url: string,
  fallbackCaption?: string
): Promise<ExtractedSocialMetadata> {
  const platform = detectPlatform(url);

  // =========================================================================
  // 1. INSTAGRAM REELS / POSTS: Deep Embed + Bot Meta + Media Extractor
  // =========================================================================
  if (platform === "instagram") {
    const shortcodeMatch = url.match(
      /(?:instagram\.com|instagr\.am)\/(?:[^/]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i
    );
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : null;

    let extractedCaption = "";
    let author = "@instagram_creator";
    let videoUrl = "";
    let imageUrl = "";
    const carouselImageUrls: string[] = [];

    if (shortcode) {
      // 1A. Fetch Instagram's public /embed/captioned/ endpoint
      try {
        const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
        const res = await fetch(embedUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const html = await res.text();

          // Parse Caption HTML block
          const captionDivMatch =
            html.match(
              /class=["']Caption["'][^>]*>([\s\S]*?)<div class=["']CaptionComments/i
            ) || html.match(/class=["']Caption["'][^>]*>([\s\S]*?)<\/div>/i);

          if (captionDivMatch) {
            extractedCaption = decodeHtmlEntities(
              stripHtmlTags(captionDivMatch[1])
            );
          }

          // Parse embedded contextJSON if present (contains un-truncated caption & video_url)
          const edgeCaptionMatch = html.match(
            /edge_media_to_caption[\s\S]{1,120}?text\\?":\\?"((?:[^"\\]|\\.)*)/i
          );
          if (edgeCaptionMatch && edgeCaptionMatch[1]) {
            const decodedEdge = decodeHtmlEntities(edgeCaptionMatch[1]);
            if (decodedEdge.length > extractedCaption.length) {
              extractedCaption = decodedEdge;
            }
          }

          const videoUrlMatch = html.match(
            /video_url\\?":\\?"(https:[^"\\]+)\\?"/i
          );
          if (videoUrlMatch && videoUrlMatch[1]) {
            videoUrl = decodeHtmlEntities(videoUrlMatch[1]);
          }

          // Collect all display_url occurrences for multi-slide carousels
          const allDisplayMatches = [
            ...html.matchAll(/display_url\\?":\\?"(https:[^"\\]+)\\?"/gi),
          ];
          for (const m of allDisplayMatches) {
            if (m[1]) {
              const decodedUrl = decodeHtmlEntities(m[1]);
              if (!carouselImageUrls.includes(decodedUrl)) {
                carouselImageUrls.push(decodedUrl);
              }
            }
          }

          const displayUrlMatch =
            html.match(/display_url\\?":\\?"(https:[^"\\]+)\\?"/i) ||
            html.match(
              /class=["']EmbeddedMediaImage["'][^>]*src=["']([^"']+)["']/i
            );
          if (displayUrlMatch && displayUrlMatch[1]) {
            imageUrl = decodeHtmlEntities(displayUrlMatch[1]);
          }

          const authorMatch =
            html.match(/class=["']UsernameText["'][^>]*>([^<]+)</i) ||
            html.match(/username\\?":\\?"([^"\\]+)\\?"/i);
          if (authorMatch && authorMatch[1]) {
            author = `@${authorMatch[1].trim()}`;
          }
        }
      } catch {
        // Continue to bot meta scrape
      }

      // 1B. Also fetch with TelegramBot User-Agent to get og:description & og:video
      try {
        const botRes = await fetch(
          `https://www.instagram.com/reel/${shortcode}/`,
          {
            headers: {
              "User-Agent": "TelegramBot (like TwitterBot)",
              "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
            },
            signal: AbortSignal.timeout(6000),
          }
        );
        if (botRes.ok) {
          const botHtml = await botRes.text();
          const ogDesc =
            botHtml.match(
              /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
            ) ||
            botHtml.match(
              /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
            );
          const ogTitle = botHtml.match(
            /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
          );
          const ogVideo = botHtml.match(
            /<meta[^>]*property=["']og:video(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i
          );
          const ogImage = botHtml.match(
            /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
          );

          const botText = [
            ogTitle ? decodeHtmlEntities(ogTitle[1]) : "",
            ogDesc ? decodeHtmlEntities(ogDesc[1]) : "",
          ]
            .filter(Boolean)
            .join("\n");

          if (botText.length > extractedCaption.length) {
            extractedCaption = botText;
          }
          if (!videoUrl && ogVideo?.[1]) {
            videoUrl = decodeHtmlEntities(ogVideo[1]);
          }
          if (!imageUrl && ogImage?.[1]) {
            imageUrl = decodeHtmlEntities(ogImage[1]);
          }
        }
      } catch {
        // ignore
      }
    }

    // Download video or carousel images so Gemini can inspect the actual Reel/Post visually/audibly
    let mediaInline: { mimeType: string; data: string } | undefined;
    let mediaInlineList: Array<{ mimeType: string; data: string }> | undefined;

    if (videoUrl) {
      mediaInline = await fetchMediaAsBase64(
        videoUrl,
        "video/mp4",
        "https://www.instagram.com/"
      );
    }
    if (!mediaInline && carouselImageUrls.length > 1) {
      const downloadedSlides = await Promise.all(
        carouselImageUrls
          .slice(0, 10)
          .map((u) =>
            fetchMediaAsBase64(u, "image/jpeg", "https://www.instagram.com/")
          )
      );
      const validSlides = downloadedSlides.filter(
        (item): item is { mimeType: string; data: string } => Boolean(item)
      );
      if (validSlides.length > 0) {
        mediaInlineList = validSlides;
        mediaInline = validSlides[0];
      }
    }
    if (!mediaInline && imageUrl) {
      mediaInline = await fetchMediaAsBase64(
        imageUrl,
        "image/jpeg",
        "https://www.instagram.com/"
      );
    }

    const combined = [extractedCaption, fallbackCaption]
      .filter(Boolean)
      .join("\n\n")
      .trim();

    if (combined.length > 0 || mediaInline || mediaInlineList?.length) {
      return {
        url,
        platform,
        title: combined.slice(0, 120) || "Instagram Reels Travel Itinerary",
        author,
        caption: combined,
        tags: extractHashtags(combined),
        rawText: `Platform: Instagram\nAuthor: ${author}\nURL: ${url}\nCaption & Konten Ekstraksi:\n${
          combined || "(Lihat konten visual/audio video/slide terlampir)"
        }`,
        extractedSuccessfully: true,
        mediaInline,
        mediaInlineList,
      };
    }
  }

  // =========================================================================
  // 2. TIKTOK: TikWM API (Caption + Video Stream / Photo Carousel) + Official oEmbed
  // =========================================================================
  if (platform === "tiktok") {
    try {
      const tikwmUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(
        url
      )}`;
      const res = await fetch(tikwmUrl, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          const title = (json.data.title as string) || "";
          const author = json.data.author?.unique_id
            ? `@${json.data.author.unique_id}`
            : "@tiktok_creator";
          const playUrl = (json.data.play as string) || "";
          const wmplayUrl = (json.data.wmplay as string) || "";
          const coverUrl = (json.data.cover as string) || "";
          const slideImages: string[] = Array.isArray(json.data.images)
            ? json.data.images
            : [];

          let mediaInline: { mimeType: string; data: string } | undefined;
          let mediaInlineList:
            | Array<{ mimeType: string; data: string }>
            | undefined;

          // 2A. If TikTok post is a Photo Carousel ("Top 10 Places" slide post)
          if (slideImages.length > 0) {
            const downloadedSlides = await Promise.all(
              slideImages
                .slice(0, 10)
                .map((imgUrl) =>
                  fetchMediaAsBase64(
                    imgUrl,
                    "image/jpeg",
                    "https://www.tiktok.com/"
                  )
                )
            );
            const validSlides = downloadedSlides.filter(
              (item): item is { mimeType: string; data: string } =>
                Boolean(item)
            );
            if (validSlides.length > 0) {
              mediaInlineList = validSlides;
              mediaInline = validSlides[0];
            }
          }

          // 2B. Otherwise download TikTok video stream (try playUrl, then compressed wmplayUrl)
          if (!mediaInline && playUrl && !playUrl.endsWith(".mp3")) {
            mediaInline = await fetchMediaAsBase64(
              playUrl,
              "video/mp4",
              "https://www.tiktok.com/"
            );
          }
          if (!mediaInline && wmplayUrl && !wmplayUrl.endsWith(".mp3")) {
            mediaInline = await fetchMediaAsBase64(
              wmplayUrl,
              "video/mp4",
              "https://www.tiktok.com/"
            );
          }
          if (!mediaInline && coverUrl) {
            mediaInline = await fetchMediaAsBase64(
              coverUrl,
              "image/jpeg",
              "https://www.tiktok.com/"
            );
          }

          const combined = [title, fallbackCaption].filter(Boolean).join("\n");
          return {
            url,
            platform,
            title: title.slice(0, 120) || "TikTok Travel Video",
            author,
            caption: combined,
            tags: extractHashtags(combined),
            rawText: `Platform: TikTok\nAuthor: ${author}\nURL: ${url}\nJumlah Slide Foto: ${slideImages.length}\nCaption Lengkap:\n${combined}`,
            extractedSuccessfully: true,
            mediaInline,
            mediaInlineList,
          };
        }
      }
    } catch {
      // Fallback to official oembed
    }

    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
        url
      )}`;
      const res = await fetch(oembedUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        const title = data.title || "";
        const author = data.author_name
          ? `@${data.author_name}`
          : "@tiktok_creator";
        const combined = [title, fallbackCaption].filter(Boolean).join("\n");
        if (combined.trim()) {
          return {
            url,
            platform,
            title: title.slice(0, 120) || "TikTok Travel Video",
            author,
            caption: combined,
            tags: extractHashtags(combined),
            rawText: `Platform: TikTok\nAuthor: ${author}\nURL: ${url}\nCaption:\n${combined}`,
            extractedSuccessfully: true,
          };
        }
      }
    } catch {
      // Proceed to OpenGraph fallback
    }
  }

  // =========================================================================
  // 3. YOUTUBE SHORTS / VIDEOS: Title + Full Description + Chapters + Native Video URI
  // =========================================================================
  if (platform === "youtube") {
    const ytIdMatch = url.match(
      /(?:youtube\.com\/(?:shorts\/|live\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/i
    );
    const videoId = ytIdMatch ? ytIdMatch[1] : null;
    const youtubeWatchUrl = videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : undefined;

    let oembedTitle = "";
    let oembedAuthor = "";
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
        youtubeWatchUrl || url
      )}&format=json`;
      const res = await fetch(oembedUrl, {
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        oembedTitle = data.title || "";
        oembedAuthor = data.author_name || "YouTube Creator";
      }
    } catch {
      // ignore
    }

    let fullDescription = "";
    let chaptersText = "";
    let keywordsText = "";
    try {
      const pageRes = await fetch(youtubeWatchUrl || url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
        },
        signal: AbortSignal.timeout(8000),
      });
      if (pageRes.ok) {
        const html = await pageRes.text();
        const shortDescMatch = html.match(
          /"shortDescription":"((?:[^"\\]|\\.)*)"/
        );
        if (shortDescMatch) {
          fullDescription = decodeHtmlEntities(shortDescMatch[1]);
        }

        // Extract YouTube video chapters (often lists each place in a Top 10 video!)
        const chapterMatches = [
          ...html.matchAll(
            /"macroMarkersListItemRenderer":\{"title":\{"simpleText":"((?:[^"\\]|\\.)*)"\},"timeDescription":\{"simpleText":"((?:[^"\\]|\\.)*)"\}/g
          ),
        ];
        if (chapterMatches.length > 0) {
          const uniqueChapters = Array.from(
            new Set(
              chapterMatches.map(
                (m) =>
                  `${decodeHtmlEntities(m[2])} - ${decodeHtmlEntities(m[1])}`
              )
            )
          );
          chaptersText = uniqueChapters.join("\n");
        }

        const kwMatch = html.match(/"keywords":\[([^\]]+)\]/);
        if (kwMatch && kwMatch[1]) {
          keywordsText = decodeHtmlEntities(kwMatch[1].replace(/"/g, ""));
        }
      }
    } catch {
      // ignore
    }

    const combined = [
      oembedTitle,
      chaptersText ? `Daftar Bab/Timestamp Video:\n${chaptersText}` : "",
      fullDescription,
      fallbackCaption,
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      url,
      platform,
      title: oembedTitle || "YouTube Travel Guide",
      author: oembedAuthor || "@youtube_creator",
      caption: combined,
      tags: extractHashtags(combined),
      rawText: `Platform: YouTube\nAuthor: ${oembedAuthor}\nURL: ${url}\nTitle: ${oembedTitle}\n${
        keywordsText ? `Keywords: ${keywordsText}\n` : ""
      }${
        chaptersText ? `Chapters:\n${chaptersText}\n` : ""
      }Description:\n${combined}`,
      extractedSuccessfully: Boolean(combined.trim() || youtubeWatchUrl),
      youtubeWatchUrl,
    };
  }

  // =========================================================================
  // 4. GENERIC OPENGRAPH FALLBACK
  // =========================================================================
  if (url.startsWith("http")) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "TelegramBot (like TwitterBot)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const html = await res.text();
        const ogTitleMatch = html.match(
          /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
        );
        const ogDescMatch = html.match(
          /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
        );
        const title = ogTitleMatch ? decodeHtmlEntities(ogTitleMatch[1]) : "";
        const desc = ogDescMatch ? decodeHtmlEntities(ogDescMatch[1]) : "";
        const combined = [title, desc, fallbackCaption]
          .filter(Boolean)
          .join("\n\n");
        if (combined.trim().length > 10) {
          return {
            url,
            platform,
            title: title || "Social Media Travel Post",
            author: `@${platform}_explorer`,
            caption: combined,
            tags: extractHashtags(combined),
            rawText: `Platform: ${platform}\nURL: ${url}\nTitle: ${title}\nDescription:\n${combined}`,
            extractedSuccessfully: true,
          };
        }
      }
    } catch {
      // ignore
    }
  }

  const combinedCaption =
    fallbackCaption?.trim() || `Travel video link from ${platform}: ${url}`;

  return {
    url,
    platform,
    title: fallbackCaption
      ? fallbackCaption.slice(0, 80)
      : `Social Media Itinerary (${platform.toUpperCase()})`,
    author: `@${platform}_traveler`,
    caption: combinedCaption,
    tags: extractHashtags(combinedCaption),
    rawText: `Platform: ${platform}\nURL: ${url}\nUser Caption/Transcript: ${combinedCaption}`,
    extractedSuccessfully: Boolean(fallbackCaption?.trim()),
  };
}
