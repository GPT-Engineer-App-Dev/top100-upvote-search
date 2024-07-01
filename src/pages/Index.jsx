import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Index = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleStories, setVisibleStories] = useState(10); // Number of stories to show initially
  const [allStoryIds, setAllStoryIds] = useState([]); // All fetched story IDs
  const [loadingMore, setLoadingMore] = useState(false); // Loading state for "Load More" button

  useEffect(() => {
    const fetchTopStories = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://hacker-news.firebaseio.com/v0/topstories.json"
        );
        const storyIds = await response.json();
        setAllStoryIds(storyIds);
        const top10Ids = storyIds.slice(0, 10);
        const storyPromises = top10Ids.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
            (res) => res.json()
          )
        );
        let stories = await Promise.all(storyPromises);
        // Sort stories by score in descending order
        stories = stories.sort((a, b) => b.score - a.score);
        setStories(stories);
        setFilteredStories(stories);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopStories();
  }, []); // Run only once on component mount

  useEffect(() => {
    const filtered = stories.filter((story) =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStories(filtered);
  }, [searchTerm, stories]);

  const loadMoreStories = async () => {
    setLoadingMore(true);
    try {
      const newVisibleStories = visibleStories + 10;
      const newStoryIds = allStoryIds.slice(visibleStories, newVisibleStories);
      const storyPromises = newStoryIds.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
          (res) => res.json()
        )
      );
      let newStories = await Promise.all(storyPromises);
      // Sort new stories by score in descending order
      newStories = newStories.sort((a, b) => b.score - a.score);
      setStories((prevStories) => {
        const combinedStories = [...prevStories, ...newStories];
        // Sort combined stories by score in descending order
        return combinedStories.sort((a, b) => b.score - a.score);
      });
      setFilteredStories((prevFilteredStories) => {
        const combinedFilteredStories = [...prevFilteredStories, ...newStories];
        // Sort combined filtered stories by score in descending order
        return combinedFilteredStories.sort((a, b) => b.score - a.score);
      });
      setVisibleStories(newVisibleStories);
    } catch (error) {
      console.error("Failed to load more stories:", error);
    } finally {
      setLoadingMore(false);
    }
  };

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
        <div>
          <ul>
            {filteredStories.map((story, index) => (
              <li key={story.id} className="mb-4 p-4 border rounded">
                <h2 className="text-xl font-bold">
                  {index + 1}. {story.title}
                </h2>
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
          {visibleStories < allStoryIds.length && (
            <div className="text-center mt-4">
              <Button onClick={loadMoreStories} disabled={loadingMore}>
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;