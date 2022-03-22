import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Course, getCourses, setFavorite, unsetFavorite } from "./api";
import { StarFilled, StarUnfilled } from "./icons";
import useLocalStorage from "./useLocalStorage";
import cx from "classnames";

function Headshot({ url }: { url: string }) {
  return <img className="h-16 rounded-full p-2" src={url} />;
}

function FavoriteIndicator({
  isFavorite,
  onFavoriteChanged,
}: {
  isFavorite: boolean;
  onFavoriteChanged: (favorite: boolean) => void;
}) {
  return (
    <div
      className={cx(
        "w-8 h-8 cursor-pointer",
        isFavorite ? "text-purple-900" : "text-purple-200",
        isFavorite ? "hover:text-purple-200" : "hover:text-purple-900"
      )}
      onClick={() => onFavoriteChanged(!isFavorite)}
      title="Toggle favorite"
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
    <div className="flex flex-row divide-purple-900 py-2 hover:bg-purple-50">
      <Headshot url={course.instructor_image_url} />
      <div className="flex-grow self-center">
        <h2 className="text-lg">{course.title}</h2>
        <div className="text-sm">{course.instructor_name}</div>
      </div>
      <div className="self-center">
        <FavoriteIndicator
          isFavorite={course.favorite}
          onFavoriteChanged={onFavoriteChanged}
        />
      </div>
    </div>
  );
}

function Courses() {
  const [courseIds, setCourseIds] = useLocalStorage<Array<number>>(
    "courseIds",
    null
  );
  const [courseData, setCourseData] = useLocalStorage<Record<string, Course>>(
    "courseData",
    null
  );

  useEffect(() => {
    (async function () {
      const courses = await getCourses();
      setCourseIds(courses.map((course) => course.id));
      const courseData: Record<string, Course> = {};
      for (const course of courses) {
        courseData[course.id] = course;
      }
      setCourseData(courseData);
    })();
  }, []);

  if (!courseIds || !courseData) {
    return null;
  }

  return (
    <div>
      <header className="text-center w-full text-2xl border-b-purple-900 border-b text-purple-900">
        "MasterClass"
      </header>
      <div className="text-purple-900 divide-y divide-purple-200 m-auto max-w-xl">
        {courseIds.map((courseId) => (
          <Course
            key={courseId}
            course={courseData[courseId]}
            onFavoriteChanged={(favorite) => {
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
        ))}
      </div>
    </div>
  );
}

function Main() {
  // TODO: actual frontend router?
  if (location.pathname === "/courses") {
    return <Courses />;
  }

  location.replace("/courses");
}

ReactDOM.render(<Main />, document.getElementById("root"));
