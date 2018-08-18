# URL SHORTENER #

This is a Express App for URL Shortener

### Pre Requisites ###

This needs MySQL to be installed.

After installing MySQL, create an user, password and database.

Then run the following scripts on the database

> create table url_list ( id INT(11) NOT NULL AUTO_INCREMENT, url VARCHAR(200) DEFAULT NULL, PRIMARY KEY(id)) ENGINE=InnoDB;

> create table short_url ( id INT(11) NOT NULL AUTO_INCREMENT, url VARCHAR(200) DEFAULT NULL, parent_id INT(11) DEFAULT NULL, PRIMARY KEY(id)) ENGINE=InnoDB;

Then go to **config/db.js** and edit the params `(user, password and database)`.

### Running the App ###

Once setting and configuring DB, simply run 

> npm install && npm start

### API Documentation ###

Shortened URLs are of the format **http://localhost:3000/r/5**

##### 1. Shortening the URL #####

> POST http://localhost:3000/shorten
> { "url" : "https://www.google.com" }

##### 2. GET all short URLs #####

> GET http://localhost:3000/allShortUrls

##### 3. GET original URL #####

> POST http://localhost:3000/fetch
> { "url" : "http://localhost:3000/r/5" }

##### 4. DELETING short urls #####

> POST http://localhost:3000/delete
> { "shortUrls" : ["http://localhost:3000/r/5"] }

