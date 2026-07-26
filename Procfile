# US-25: Tells Heroku how to start the app after a build.
# Heroku assigns the port via $PORT; Spring must listen on it.
web: java -Dserver.port=$PORT -jar backend/target/backend-0.0.1-SNAPSHOT.jar
