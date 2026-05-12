export default interface Poll {
  _id: string;
  question: string;
  options: { text: string; voters: string[] }[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
}
