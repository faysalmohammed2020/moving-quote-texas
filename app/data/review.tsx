export interface Review {
  name: string;
  role: string;
  date: string;
  rating: number;
  text: string;
  image: string;
}

export const reviews: Review[] = [
  {
    name: "John Doe",
    role: "Texas Company",
    date: "14th Feb, 2024",
    rating: 5,
    text: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore. Lorem Ipsum Dolor Sit Amet.",
    image: "/image/profile.png",
  },
  {
    name: "Micheal Antony",
    role: "California",
    date: "14th Feb, 2024",
    rating: 5,
    text: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore. Lorem Ipsum Dolor Sit Amet.",
    image: "/image/profile.png",
  },
  {
    name: "Emily Rose",
    role: "Texas Company",
    date: "14th Feb, 2024",
    rating: 4,
    text: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore. Lorem Ipsum Dolor Sit Amet.",
    image: "/image/profile.png",
  },
  {
    name: "John Smith",
    role: "Texas Company",
    date: "14th Feb, 2024",
    rating: 4,
    text: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore. Lorem Ipsum Dolor Sit Amet.",
    image: "/image/profile.png",
  },
  {
    name: "Mr. Johnny",
    role: "Texas Company",
    date: "14th Feb, 2024",
    rating: 4,
    text: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore. Lorem Ipsum Dolor Sit Amet.",
    image: "/image/profile.png",
  },
  {
    name: "Martin",
    role: "Texas Company",
    date: "14th Feb, 2024",
    rating: 4,
    text: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore. Lorem Ipsum Dolor Sit Amet.",
    image: "/image/profile.png",
  },
];
