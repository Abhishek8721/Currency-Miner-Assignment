Step 1
Clone this repository to your local machine

Step 2
Install the required dependencies using npm install

Step 3
Set your SECRET_KEY environment variable:
Create a .env file in the root of the project with the following content
SECRET_KEY=your_jwt_secret_key

Step 4
Start the server using nodemon

API Endpoints
1. POST /api/register
Description: Registers a new user by accepting a username and password.
Request Body:
{
  "username": "newuser",
  "password": "newpassword123"
}

2. POST /api/login
Description: Authenticates a user and returns a JWT token.

Request Body:
{
  "username": "user",
  "password": "password123"
}

3. POST /api/mine/start
Description: Starts a mining session for the authenticated user.
Authentication: Requires a valid JWT token in the Authorization header.

4. POST /api/mine/claim
Description: Claims the coins earned by the user during their mining session.
Authentication: Requires a valid JWT token in the Authorization header.
