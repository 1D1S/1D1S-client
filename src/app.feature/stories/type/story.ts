export interface StoryItem {
  diaryId: number;
  diaryTitle: string;
  diaryThumbnail: string | null;
  createdAt: string;
  hasUnreadJournal: boolean;
}

export interface StoryGroup {
  userId: number;
  profileImage: string | null;
  nickname?: string | null;
  stories: StoryItem[];
}

export interface StoriesResponse {
  storyGroups: StoryGroup[];
  unreadCount: number;
}
