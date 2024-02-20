import { useState } from "react";

export const useCourseGrades = () => {
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourseGrades = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Make a request to fetch course grades from the backend
      const response = await fetch('/api/v1/course-grades');

      if (!response.ok) {
        const json = await response.json();
        setError(json.error);
      } else {
        const json = await response.json();
        setGrades(json);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { grades, isLoading, error, fetchCourseGrades };
};
