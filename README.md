Financial planning using web components


work in progress...

# Running the project

To run the project with a persistent mongodb database and localStorage as cache you need to have docker installed and run `docker-compose up` from the root directory..


You can alternatively run the frontend locally (without any server or database) by setting the `localMode` attribute in the movement-table component to true, which will make the table component use only localStorage as a database.

# Project structure

* All frontend files are located inside the 'public' folder.
* The frontend is built using web components (vanilla js).
* There's no webpack or any other build tool, the frontend is served as static files from the public folder.
* There's also no third party libraries, but this will most likely change in the future.
