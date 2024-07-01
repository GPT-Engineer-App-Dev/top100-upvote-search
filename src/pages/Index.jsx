import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Index = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTopStories = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://hacker-news.firebaseio.com/v0/topstories.json"
        );
        const storyIds = await response.json();
        const top100Ids = storyIds.slice(0, 100);
        const storyPromises = top100Ids.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
            (res) => res.json()
          )
        );
        const stories = await Promise.all(storyPromises);
        setStories(stories);
        setFilteredStories(stories);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopStories();
  }, []);

  useEffect(() => {
    const filtered = stories.filter((story) =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStories(filtered);
  }, [searchTerm, stories]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl text-center mb-4">Hacker News Top 100 Stories</h1>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search stories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      {loading ? (
        <Skeleton count={10} height={50} />
      ) : (
        <ul>
          {filteredStories.map((story) => (
            <li key={story.id} className="mb-4 p-4 border rounded">
              <h2 className="text-xl font-bold">{story.title}</h2>
              <p>Upvotes: {story.score}</p>
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                Read more
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Index;