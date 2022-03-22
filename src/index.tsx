import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Course, getCourses, setFavorite, unsetFavorite } from "./api";
import { Spinner, StarFilled, StarUnfilled } from "./icons";
import useLocalStorage from "./useLocalStorage";
import cx from "classnames";

function Headshot({ url }: { url: string }) {
  return <img className="h-16 rounded-full p-2" src={url} />;
}

function FavoriteIndicator({ isFavorite }: { isFavorite: boolean }) {
  return (
    <div
      className={cx(
        "w-8 h-8",
        isFavorite ? "text-purple-900" : "text-purple-200"
      )}
    >
      {isFavorite ? <StarFilled /> : <StarUnfilled />}
    </div>
  );
}

function Course({
  course,
  onFavoriteChanged,
}: {
  course: Course;
  onFavoriteChanged: (favorite: boolean) => void;
}) {
  return (
    <div
      className="flex flex-row divide-purple-900 py-2 hover:bg-purple-50 cursor-pointer"
      onClick={() => onFavoriteChanged(!course.favorite)}
      title="Toggle favorite"
    >
      <Headshot url={course.instructor_image_url} />
      <div className="flex-grow self-center">
        <h2 className="text-lg">{course.title}</h2>
        <div className="text-sm">{course.instructor_name}</div>
      </div>
      <div className="self-center">
        <FavoriteIndicator isFavorite={course.favorite} />
      </div>
    </div>
  );
}

function Courses({
  courses,
  onFavoriteChanged,
}: {
  courses: Array<Course>;
  onFavoriteChanged: (courseId: number, favorite: boolean) => void;
}) {
  return (
    <div className="text-purple-900 divide-y divide-purple-200">
      {courses.map((course) => (
        <Course
          key={course.id}
          course={course}
          onFavoriteChanged={(favorite) => {
            onFavoriteChanged(course.id, favorite);
          }}
        />
      ))}
    </div>
  );
}

function CoursesPage() {
  const [courseIds, setCourseIds] = useLocalStorage<Array<number>>(
    "courseIds",
    null
  );
  const [courseData, setCourseData] = useLocalStorage<Record<string, Course>>(
    "courseData",
    null
  );
  const [onlyShowFavorites, setOnlyShowFavorites] = useLocalStorage<boolean>(
    "onlyShowFavorites",
    false
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function () {
      const courses = await getCourses();
      setCourseIds(courses.map((course) => course.id));
      const courseData: Record<string, Course> = {};
      for (const course of courses) {
        courseData[course.id] = course;
      }
      setCourseData(courseData);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="sticky top-0 left-0 text-purple-900">
        <header className="text-center w-full text-2xl border-b-purple-900 border-b bg-white">
          "MasterClass"
        </header>
        <div className="max-w-xl m-auto bg-white flex border-b border-b-purple-200 h-8">
          <input
            type="checkbox"
            className=" ml-2 mr-1"
            id="showFavorites"
            onChange={() => setOnlyShowFavorites(!onlyShowFavorites)}
            checked={onlyShowFavorites}
          />
          <label htmlFor="showFavorites" className="text-sm self-center">
            Only show favorites
          </label>
          <div className="flex-1" />
          {loading && <Spinner />}
        </div>
        <div className="h-2 bg-gradient-to-b from-white to-transparent" />
      </div>
      {courseIds && courseData && (
        <div className="max-w-xl m-auto">
          <Courses
            courses={courseIds
              .filter(
                (courseId) =>
                  !onlyShowFavorites || courseData[courseId].favorite
              )
              .map((courseId) => courseData[courseId])}
            onFavoriteChanged={(courseId, favorite) => {
              if (favorite) {
                setFavorite(courseId);
              } else {
                unsetFavorite(courseId);
              }

              // Optimism!
              setCourseData({
                ...courseData,
                [courseId]: {
                  ...courseData[courseId],
                  favorite,
                },
              });
            }}
          />
        </div>
      )}
    </div>
  );
}

function Main() {
  // TODO: actual frontend router?
  if (location.pathname === "/courses") {
    return <CoursesPage />;
  }

  location.replace("/courses");
  return null;
}

ReactDOM.render(<Main />, document.getElementById("root"));
