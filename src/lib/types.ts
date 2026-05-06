export interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  image: string;
  category: string;
  lessons: number;
}

export interface Stat {
  label: string;
  value: string | number;
  change: number;
  icon: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  avatar: string;
  unread: boolean;
}
