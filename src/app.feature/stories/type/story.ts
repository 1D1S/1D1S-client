export interface StoryItem {
  diaryId: number;
  diaryTitle: string;
  diaryThumbnail: string | null;
  createdAt: string;
  hasUnreadJournal: boolean;
}

export interface StoryGroup {
  userId: number;
  userName?: string | null;
  profileImage: string | null;
  isMyStory?: boolean;
  stories: StoryItem[];
}

export interface StoriesResponse {
  storyGroups: StoryGroup[];
  unreadCount: number;
}
