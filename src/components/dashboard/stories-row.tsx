"use client";

import {
  Bookmark,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Compass,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Tag,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { createStoryAction } from "@/app/actions/stories";
import { Button } from "@/components/ui/button";
import type { PublicProfile } from "@/lib/profile/types";
import { getInitials } from "@/lib/utils";

export interface StoryItem {
  badge: string;
  badgeColor: string;
  date: string;
  discussionQuery?: string;
  gradient: string;
  id: string;
  imageUrl?: string;
  isInstitutionEvent?: boolean;
  location: string;
  organizer: string;
  organizerAvatarUrl?: string | null;
  organizerRole?: string;
  subtitle: string;
  summary: string;
  tags: string[];
  title: string;
}

const INITIAL_STORIES: StoryItem[] = [
  {
    badge: "BUET",
    badgeColor: "bg-blue-600",
    date: "Aug 28-29, 2026 · 36 Hours",
    discussionQuery: "BUET",
    gradient: "from-slate-900 via-blue-950 to-slate-900",
    id: "story-1",
    imageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    isInstitutionEvent: true,
    location: "ECE Building, BUET Campus, Dhaka",
    organizer: "BUET CSE Society & Alumni Chapter",
    organizerRole: "University Organizer",
    subtitle: "Top 3 Finish & Showcase",
    summary:
      "National level 36-hour hackathon focusing on AI for Bengali NLP and FinTech solutions. Over 120 teams participating from across Bangladesh with 1-on-1 mentorship from industry alumni in Silicon Valley and Dhaka.",
    tags: ["Hackathon", "AI & ML", "FinTech"],
    title: "BUET Inter-Uni Hackathon",
  },
  {
    badge: "DU",
    badgeColor: "bg-emerald-600",
    date: "Sep 4, 2026 · 4:00 PM - 9:00 PM",
    discussionQuery: "Dhaka University",
    gradient: "from-slate-900 via-emerald-950 to-slate-900",
    id: "story-2",
    imageUrl:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80",
    isInstitutionEvent: true,
    location: "TSC Auditorium, University of Dhaka",
    organizer: "Dhaka University IT Society (DUITS)",
    organizerRole: "Faculty & Alumni Council",
    subtitle: "Alumni Reunion & Mentorship",
    summary:
      "Annual technology festival connecting current undergraduate students with alumni leaders. Features fireside panels on overseas higher studies, tech entrepreneurship, resume reviews, and startup investment pitches.",
    tags: ["Networking", "Career Guidance", "Reunion"],
    title: "Campus Fest & Alumni Gala",
  },
  {
    badge: "NSU",
    badgeColor: "bg-sky-600",
    date: "Sep 10, 2026 · 2:30 PM",
    discussionQuery: "NSU",
    gradient: "from-slate-900 via-teal-950 to-slate-900",
    id: "story-3",
    imageUrl:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    isInstitutionEvent: true,
    location: "Auditorium 801, NSU Campus, Bashundhara",
    organizer: "North South University ACM Chapter",
    organizerRole: "Student Chapter",
    subtitle: "Cloud & Backend Architectures",
    summary:
      "Technical deep-dive into distributed systems, event-driven architectures, and high-concurrency database optimizations. Keynote delivered by senior alumni tech leads.",
    tags: ["Backend", "Cloud Systems", "Tech Talk"],
    title: "Tech Talk: Scalable Systems",
  },
  {
    badge: "SUST",
    badgeColor: "bg-purple-600",
    date: "Sep 18, 2026 · 10:00 AM",
    discussionQuery: "SUST",
    gradient: "from-slate-900 via-purple-950 to-slate-900",
    id: "story-4",
    imageUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    isInstitutionEvent: true,
    location: "Academic Building D, SUST, Sylhet",
    organizer: "SUST Robotics & Machine Vision Lab",
    organizerRole: "Research Wing",
    subtitle: "Paper Presentations & Demos",
    summary:
      "Showcasing undergraduate and postgraduate research papers in robotics, agricultural computer vision, and autonomous IoT systems with industry feedback.",
    tags: ["Research", "Robotics", "Computer Vision"],
    title: "AI Research Summit 2026",
  },
];

const LOCAL_STORAGE_STORIES_KEY = "shongjog_active_stories_v1";

function mergeUniqueStories(
  dbStories: StoryItem[],
  cachedStories: StoryItem[],
  defaultStories: StoryItem[]
): StoryItem[] {
  const userStoriesMap = new Map<string, StoryItem>();

  // 1. First add real DB stories across all accounts (Primary priority)
  dbStories.forEach((s) => userStoriesMap.set(s.id, s));

  // 2. Add local cached stories if not already present
  cachedStories.forEach((s) => {
    if (!userStoriesMap.has(s.id)) {
      userStoriesMap.set(s.id, s);
    }
  });

  const realStoriesList = Array.from(userStoriesMap.values());

  // 3. Filler spotlights:
  // If fewer than 2 real stories exist, append up to 2 spotlights at the end.
  // If 2 or more real stories exist, append at most 1-2 spotlights at the end.
  const fillerSpotlights = defaultStories.filter((s) => !userStoriesMap.has(s.id));
  const spotlightsToAdd =
    realStoriesList.length === 0
      ? fillerSpotlights.slice(0, 4)
      : realStoriesList.length === 1
      ? fillerSpotlights.slice(0, 2)
      : fillerSpotlights.slice(0, 1);

  return [...realStoriesList, ...spotlightsToAdd];
}

export function StoriesRow({
  initialDbStories = [],
  profile,
}: {
  initialDbStories?: StoryItem[];
  profile: PublicProfile;
}) {
  const [stories, setStories] = useState<StoryItem[]>(() =>
    mergeUniqueStories(initialDbStories, [], INITIAL_STORIES)
  );
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [savedStoryIds, setSavedStoryIds] = useState<Set<string>>(new Set());

  // Form state for creating a new photo story
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newTag, setNewTag] = useState("Campus Tour & Hangout");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingStoryImg, setIsUploadingStoryImg] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const selectedStory =
    activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  // Re-hydrate stories whenever initialDbStories or localStorage updates
  useEffect(() => {
    let cached: StoryItem[] = [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cached = parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to read cached stories from localStorage:", e);
    }
    setStories(mergeUniqueStories(initialDbStories, cached, INITIAL_STORIES));
  }, [initialDbStories]);

  // Auto advance story progress in viewer
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (activeStoryIndex === null) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story if available
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((curr) => (curr !== null ? curr + 1 : null));
          } else {
            setActiveStoryIndex(null);
          }
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, stories.length]);

  const handleStoryFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image file must be under 8MB.");
      return;
    }

    setUploadError(null);
    setIsUploadingStoryImg(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "shongjog/stories");

      // Isolated media endpoint - DOES NOT TOUCH USER PROFILE AVATAR
      const response = await fetch("/api/upload/media", {
        body: formData,
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to upload photo.");
      }

      if (data.url) {
        setNewImageUrl(data.url);
      }
    } catch (err) {
      console.error("Story image upload failed:", err);
      setUploadError(
        err instanceof Error ? err.message : "Story photo upload failed."
      );
    } finally {
      setIsUploadingStoryImg(false);
      if (storyFileInputRef.current) {
        storyFileInputRef.current.value = "";
      }
    }
  };

  const toggleBookmark = (id: string) => {
    setSavedStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl) {
      setUploadError("Please upload a photo for your story before posting.");
      return;
    }

    setIsSubmitting(true);

    const userInitials = getInitials(profile.fullName);

    const customStory: StoryItem = {
      badge: userInitials,
      badgeColor: "bg-primary",
      date: "Just now · Active 24h",
      discussionQuery: profile.details.universityName || "Campus",
      gradient: "from-primary/90 via-blue-900 to-indigo-950",
      id: `custom-${Date.now()}`,
      imageUrl: newImageUrl.trim(),
      isInstitutionEvent: false,
      location: profile.details.universityName || "Campus Network",
      organizer: profile.fullName || "You",
      organizerAvatarUrl: profile.avatarUrl,
      organizerRole:
        profile.details.role === "student" ? "Student Member" : "Alumni Mentor",
      subtitle: newTag,
      summary:
        newSummary.trim() ||
        `${newTitle} - Shared by ${profile.fullName || "Student"} with the campus network.`,
      tags: [newTag, "Campus Story"],
      title: newTitle.trim(),
    };

    // 1. Optimistic update
    const updatedStories = [customStory, ...stories];
    setStories(updatedStories);

    // 2. Persist to localStorage backup
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
      const existing: StoryItem[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(
        LOCAL_STORAGE_STORIES_KEY,
        JSON.stringify([customStory, ...existing].slice(0, 20))
      );
    } catch (err) {
      console.warn("Could not save story to localStorage:", err);
    }

    // 3. Persist to Supabase Database
    startTransition(async () => {
      try {
        await createStoryAction({
          category: newTag,
          description: newSummary.trim() || undefined,
          headline: newTitle.trim(),
          mediaUrl: newImageUrl.trim(),
        });
      } catch (err) {
        console.error("Server action createStory error:", err);
      }
    });

    setNewTitle("");
    setNewSummary("");
    setNewImageUrl("");
    setIsSubmitting(false);
    setIsCreateOpen(false);
  };

  const handlePrevStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  const handleNextStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  return (
    <>
      {/* Stories Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-none">
        {/* Create "Your Story" Card */}
        <button
          className="snap-start shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-800 p-3 flex flex-col justify-between text-white relative overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer text-left group border border-primary/40"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          {/* User's Profile Picture / Plus Badge */}
          <div className="relative size-10 rounded-full ring-2 ring-white/90 overflow-hidden bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
            {profile.avatarUrl ? (
              <Image
                alt={profile.fullName || "You"}
                className="size-full object-cover"
                height={40}
                src={profile.avatarUrl}
                width={40}
              />
            ) : (
              <span className="text-xs font-bold text-white">
                {getInitials(profile.fullName)}
              </span>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-primary text-white flex items-center justify-center ring-1 ring-white shadow">
              <Plus className="size-3" />
            </div>
          </div>

          <div className="z-10">
            <p className="text-xs font-bold leading-tight">Your Story</p>
            <p className="text-[10px] text-white/80 mt-0.5">
              Share photo & caption
            </p>
          </div>

          <div className="absolute inset-0 bg-radial from-transparent to-black/30 pointer-events-none" />
        </button>

        {/* Dynamic Photo Story Cards */}
        {stories.map((story, idx) => {
          const isSaved = savedStoryIds.has(story.id);

          return (
            <button
              className={`snap-start shrink-0 w-28 sm:w-32 h-44 sm:h-48 rounded-2xl bg-gradient-to-br ${story.gradient} p-3 flex flex-col justify-between text-white relative overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer text-left border border-white/10 group`}
              key={story.id}
              onClick={() => setActiveStoryIndex(idx)}
              type="button"
            >
              {/* Photo Background Cover */}
              {story.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={story.title}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={story.imageUrl}
                />
              ) : null}

              {/* Gradient Scrim for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none" />

              {/* Top Header Badge & Saved Indicator */}
              <div className="relative z-10 flex items-center justify-between">
                {story.isInstitutionEvent ? (
                  /* Institutional Spotlight Badge (e.g. BUET, DU, NSU, SUST) */
                  <div
                    className={`flex size-8 items-center justify-center rounded-full ${story.badgeColor} text-[10px] font-extrabold text-white ring-2 ring-white/90 shadow-md`}
                  >
                    {story.badge}
                  </div>
                ) : (
                  /* User Author Profile Avatar Badge */
                  <div className="relative size-9 rounded-full ring-2 ring-primary ring-offset-1 ring-offset-black/50 overflow-hidden bg-zinc-800 flex items-center justify-center shadow-md">
                    {story.organizerAvatarUrl ? (
                      <Image
                        alt={story.organizer || "Author"}
                        className="size-full object-cover"
                        height={36}
                        src={story.organizerAvatarUrl}
                        width={36}
                      />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {getInitials(story.organizer)}
                      </span>
                    )}
                  </div>
                )}

                {isSaved ? (
                  <span className="flex size-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-xs">
                    <Bookmark className="size-3.5 fill-amber-400 text-amber-400" />
                  </span>
                ) : null}
              </div>

              {/* Bottom Caption & Tag Text Overlay */}
              <div className="relative z-10">
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-primary-foreground/90 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-md mb-1">
                  {story.subtitle}
                </span>
                <p className="text-xs font-bold leading-snug line-clamp-2 text-white drop-shadow-sm">
                  {story.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 1. Create Photo Story Modal (UPLOAD-ONLY INTERFACE, NO RAW URL INPUT) */}
      {isCreateOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
        >
          <div
            className="fixed inset-0"
            onClick={() => !isSubmitting && !isUploadingStoryImg && setIsCreateOpen(false)}
          />

          <div className="relative w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-3xl border border-border/80 dark:border-slate-800 bg-card shadow-2xl flex flex-col md:flex-row transition-all my-auto z-10">
            {/* Left: Live Story Canvas Preview (Compact on mobile, 9:16 on desktop) */}
            <div className="relative bg-slate-950 flex flex-col justify-between p-4 sm:p-5 h-48 sm:h-64 md:h-auto md:w-1/2 shrink-0 md:min-h-[480px] text-white overflow-hidden rounded-t-3xl md:rounded-t-none md:rounded-l-3xl">
              {newImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Story preview"
                  className="absolute inset-0 size-full object-cover"
                  src={newImageUrl}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                  <div className="size-12 sm:size-16 rounded-full bg-white/10 flex items-center justify-center mb-2 sm:mb-3">
                    <Camera className="size-6 sm:size-8 text-white/60" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-white/90">
                    Your Photo Story Canvas
                  </p>
                  <p className="text-[11px] sm:text-xs text-white/60 mt-0.5 max-w-xs">
                    Upload a picture from your device to see the real-time canvas preview
                  </p>
                </div>
              )}

              {/* Gradient Overlay for Text Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 pointer-events-none" />

              {/* Top: User info badge */}
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="relative size-8 sm:size-9 rounded-full ring-2 ring-white/90 overflow-hidden bg-primary flex items-center justify-center shadow shrink-0">
                  {profile.avatarUrl ? (
                    <Image
                      alt={profile.fullName || "You"}
                      className="size-full object-cover"
                      height={36}
                      src={profile.avatarUrl}
                      width={36}
                    />
                  ) : (
                    <span className="text-xs font-bold text-white">
                      {getInitials(profile.fullName)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white leading-tight">
                    {profile.fullName || "Your Story"}
                  </p>
                  <p className="truncate text-[10px] text-white/70">
                    {profile.details.universityName || "Campus Network"}
                  </p>
                </div>
              </div>

              {/* Bottom: Text Overlay Preview */}
              <div className="relative z-10 space-y-1">
                <span className="inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white bg-primary/80 backdrop-blur-xs px-2 py-0.5 rounded-full">
                  {newTag}
                </span>
                <p className="text-sm sm:text-lg font-bold leading-tight text-white drop-shadow-md line-clamp-2">
                  {newTitle || "Your Story Headline"}
                </p>
                {newSummary ? (
                  <p className="text-[11px] sm:text-xs text-white/80 line-clamp-2 leading-relaxed">
                    {newSummary}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Right: Form Controls (With Sticky Action Footer) */}
            <div className="p-4 sm:p-6 flex flex-col justify-between flex-1 md:w-1/2">
              <div>
                <div className="flex items-center justify-between border-b border-border/60 dark:border-slate-800 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span>Create Photo Story</span>
                  </h3>
                  <button
                    aria-label="Close"
                    className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setIsCreateOpen(false)}
                    type="button"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <form className="mt-4 space-y-3.5" onSubmit={handleCreateStory}>
                  {/* Clean Upload Area Trigger (No URL input box) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Story Photo <span className="text-destructive">*</span>
                    </label>

                    <div
                      className="border-2 border-dashed border-border/80 dark:border-slate-700 hover:border-primary/60 dark:hover:border-primary/60 bg-muted/30 dark:bg-slate-800/40 rounded-2xl p-3.5 sm:p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group"
                      onClick={() => storyFileInputRef.current?.click()}
                    >
                      <div className="size-9 sm:size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                        {isUploadingStoryImg ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <Upload className="size-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {isUploadingStoryImg
                            ? "Uploading to Cloud..."
                            : newImageUrl
                            ? "Photo Selected (Click to change)"
                            : "Click to upload photo from device"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          PNG, JPG, WebP up to 8MB
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        <Camera className="size-3" />
                        <span>{newImageUrl ? "Change Photo" : "Browse Device"}</span>
                      </span>
                    </div>

                    <input
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleStoryFileUpload}
                      ref={storyFileInputRef}
                      type="file"
                    />

                    {uploadError ? (
                      <p className="text-xs font-medium text-destructive mt-1">
                        {uploadError}
                      </p>
                    ) : null}
                  </div>

                  {/* Headline / Caption Overlay */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Headline / Caption Overlay <span className="text-destructive">*</span>
                    </label>
                    <input
                      className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      maxLength={100}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Tour at Zinda Park with batchmates!"
                      required
                      value={newTitle}
                    />
                  </div>

                  {/* Category Tag */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Category
                    </label>
                    <select
                      className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      onChange={(e) => setNewTag(e.target.value)}
                      value={newTag}
                    >
                      <option value="Campus Tour & Hangout">
                        Campus Tour & Hangout
                      </option>
                      <option value="Academic Milestone">
                        Academic Milestone
                      </option>
                      <option value="Hackathon Milestone">
                        Hackathon Milestone
                      </option>
                      <option value="Project Launch">Project Launch</option>
                      <option value="Campus Event">Campus Event</option>
                      <option value="Alumni Meetup">Alumni Meetup</option>
                    </select>
                  </div>

                  {/* Optional description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Description (Optional)
                    </label>
                    <textarea
                      className="min-h-16 w-full resize-none rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      maxLength={300}
                      onChange={(e) => setNewSummary(e.target.value)}
                      placeholder="Add details, memories, or links..."
                      value={newSummary}
                    />
                  </div>

                  {/* Sticky Action Footer */}
                  <div className="sticky bottom-0 bg-card/95 dark:bg-slate-900/95 backdrop-blur-md pt-3 pb-1 border-t border-border/60 dark:border-slate-800 flex items-center justify-end gap-2.5 mt-4 z-10">
                    <Button
                      isDisabled={isSubmitting || isUploadingStoryImg}
                      onClick={() => setIsCreateOpen(false)}
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="gap-2 bg-primary text-white"
                      isDisabled={
                        !newTitle.trim() ||
                        !newImageUrl ||
                        isSubmitting ||
                        isUploadingStoryImg
                      }
                      type="submit"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      <span>Share Story</span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. Full-Screen Instagram-Style Story Viewer Modal */}
      {selectedStory ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
          role="dialog"
        >
          {/* Backdrop Click to Close */}
          <div
            className="fixed inset-0"
            onClick={() => setActiveStoryIndex(null)}
          />

          {/* Left Arrow Navigation */}
          {activeStoryIndex !== null && activeStoryIndex > 0 ? (
            <button
              aria-label="Previous story"
              className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-colors cursor-pointer"
              onClick={handlePrevStory}
              type="button"
            >
              <ChevronLeft className="size-6" />
            </button>
          ) : null}

          {/* Right Arrow Navigation */}
          <button
            aria-label="Next story"
            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-colors cursor-pointer"
            onClick={handleNextStory}
            type="button"
          >
            <ChevronRight className="size-6" />
          </button>

          {/* 9:16 Vertical Story Viewer Frame */}
          <div
            className="relative z-10 w-full max-w-sm sm:max-w-md h-[85vh] max-h-[760px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-5 text-white border border-white/20 bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Story Canvas Image */}
            {selectedStory.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={selectedStory.title}
                className="absolute inset-0 size-full object-cover"
                src={selectedStory.imageUrl}
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${selectedStory.gradient}`}
              />
            )}

            {/* Gradient Scrims for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/60 pointer-events-none" />

            {/* Top Bar: Progress + Author info + Close button */}
            <div className="relative z-10 space-y-3">
              {/* Progress bar timer */}
              <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full transition-all ease-linear duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Author & University Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {selectedStory.isInstitutionEvent ? (
                    <div
                      className={`flex size-9 items-center justify-center rounded-full ${selectedStory.badgeColor} text-xs font-bold text-white ring-2 ring-white/80 shadow`}
                    >
                      {selectedStory.badge}
                    </div>
                  ) : (
                    <div className="relative size-10 rounded-full ring-2 ring-primary ring-offset-1 ring-offset-black/50 overflow-hidden bg-zinc-800 flex items-center justify-center shadow">
                      {selectedStory.organizerAvatarUrl ? (
                        <Image
                          alt={selectedStory.organizer || "Author"}
                          className="size-full object-cover"
                          height={40}
                          src={selectedStory.organizerAvatarUrl}
                          width={40}
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {getInitials(selectedStory.organizer)}
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {selectedStory.organizer}
                    </p>
                    <p className="text-[10px] text-white/80">
                      {selectedStory.date}
                    </p>
                  </div>
                </div>

                <button
                  aria-label="Close story viewer"
                  className="flex size-8 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer"
                  onClick={() => setActiveStoryIndex(null)}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Bottom: Text Overlay + Event Details + Action Buttons */}
            <div className="relative z-10 space-y-3">
              {/* Category & Headline */}
              <div className="space-y-1">
                <span className="inline-block rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  {selectedStory.subtitle}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-md">
                  {selectedStory.title}
                </h2>
              </div>

              {/* Summary Description */}
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                {selectedStory.summary}
              </p>

              {/* Location Tag */}
              {selectedStory.location ? (
                <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                  <MapPin className="size-3.5 text-primary" />
                  <span className="truncate">{selectedStory.location}</span>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-colors border cursor-pointer ${
                    savedStoryIds.has(selectedStory.id)
                      ? "border-amber-400 bg-amber-500/20 text-amber-300"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                  onClick={() => toggleBookmark(selectedStory.id)}
                  type="button"
                >
                  <Bookmark
                    className={`size-3.5 ${
                      savedStoryIds.has(selectedStory.id)
                        ? "fill-amber-400 text-amber-400"
                        : ""
                    }`}
                  />
                  <span>
                    {savedStoryIds.has(selectedStory.id)
                      ? "Saved"
                      : "Bookmark"}
                  </span>
                </button>

                <Link
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-semibold transition-colors shadow-md text-center"
                  href={`/discover?q=${encodeURIComponent(
                    selectedStory.discussionQuery || selectedStory.title
                  )}`}
                  onClick={() => setActiveStoryIndex(null)}
                >
                  <MessageSquare className="size-3.5" />
                  <span>Join Discussion</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
