# 🚀 E-learning 🌐

This is a Robust Backend of an E-learning system build using express, typescript, prisma and postgresql.

## Tech used:
- **BACKEND:** **ExpressJs**, **Typescript**, **Prisma**, **Postgresql**, **Neon.tech DB**.

## Features

- **Auth: Login, Register and Profile update. Validation is also added**
- **Course:**
    - **1. Create course.**
    - **2. Get a single course. You will get lessons and videos along with the reviews you are enrolled in this course**
    - **3. update a course. You can only update the course if you are the creator of that course.**
    - **4. get all created courses.**
    - **5. get all available courses. No validation required for this.**
    - **6. delete a course. You can delete the course only if you are the creator of that course.**
- **Reviews:**
    - **1. Give a review. You can only give  a review  if you are enrolled in that course, if you are not the creator of that course.**
    - **2. Update a review. You can only update  a review if you have give that review.**
    - **3. Delete a review. You can only delete a review if have given the review.**
    - **4. Get all reviews on a courses.**
- **Lesson:**
    - **1. Create Lesson for a course. You can only create  a lesson if you have give created that course.**
    - **2. Update a Lesson description. You can only create  a lesson if you have give created that course.**
    - **3. Delete a Lesson. You can only delete a lesson if you have give**
    - **4. Get all lesson of a course. You can only get all lesson of a course if you have created that course.**
- **Video:**
    - **1. Create a video for a lesson and a course. You can only create a video if you have give created that course.**   
    - **2. Update the video for a lesson and a course. You can only update if you have created that course.**
    - **3. Delete the video for a lesson. You can only delete if you have created that course.**
- **Enrollment:**
    - **1. Enroll in a course.**
    - **2. Get all enrolled courses for a user.**   
    - **3. Get all user enrolled in a course. You can only get if are the creator of that course.**   


## Installation 🛠️

Follow these steps to set up the Github User Repo Explorer on your local machine:

- **Clone the repository.**
```bash
git clone https://github.com/absiemon/e-learning-backend.git
```
- **Move to the project directory.**
```bash
cd yourProjectDirName
```
- **Install required packages.**
```bash
npm install
or 
yarn install
```

- **Create a postgres db and resend account(for emails).**

- **Create env file and add your credentials into it**
```bash
DATABASE_URL= 
JWT_SECRET=
RESEND_EMAIL_API_KEY=
```

- **Migrate the changes**
```bash
npx prisma generate
prisma db push
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)

