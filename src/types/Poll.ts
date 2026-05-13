export default interface Poll {
  _id: string;
  question: string;
  options: { text: string; gif?: string; voters: string[] }[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isPublic: boolean;
  slug?: string;
  endsAt?: string;
  isClosed: boolean;
}
