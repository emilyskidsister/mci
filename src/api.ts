const BASE_URL = `https://mc-dev-5.herokuapp.com/`;
const EMAIL = "jocelyn@nettek.ca";

const COURSES_URL = `${BASE_URL}/jsonapi/v1/courses?email=${EMAIL}`;
const FAVOURITE_URL = `${BASE_URL}/jsonapi/v1/favorite`;

export interface Course {
  title: string;
  instructor_name: string;
  instructor_image_url: string;
  favorite: boolean;
  id: number;
}

export async function getCourses(): Promise<Array<Course>> {
  const request = await fetch(COURSES_URL, {
    headers: {
      "content-type": "application/json",
    },
  });

  const courses = await request.json();
  return courses;
}

export async function setFavorite(id: number): Promise<void> {
  const request = await fetch(FAVOURITE_URL, {
    method: "POST",
    body: JSON.stringify({ email: EMAIL, course_id: id }),
    headers: {
      "content-type": "application/json",
    },
  });

  await request.json();
}

export async function unsetFavorite(id: number): Promise<void> {
  const request = await fetch(FAVOURITE_URL, {
    method: "DELETE",
    body: JSON.stringify({ email: EMAIL, course_id: id }),
    headers: {
      "content-type": "application/json",
    },
  });

  await request.json();
}
