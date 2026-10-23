Library Books API

REST API design for a library's books resource.

Endpoints

List books
- Method: GET
- Path: `/books`
- Description: Returns every book in the library.
- Request body: None
- Success status: `200 OK`

Get one book
- Method: GET
- Path: `/books/{id}`
- Description: Returns one book by its numeric ID.
- Request body: None
- Success status: `200 OK`

Create a book
- Method: POST
- Path: `/books`
- Description: Adds a new book to the library.
- Example request body:
  
```json
  {
    "title": "The Left Hand of Darkness",
    "author": "Ursula K. Le Guin",
    "year": 1969
  }
  ```

- Success status: `201 Created`

Update a book
- Method: PATCH
- Path: `/books/{id}`
- Description: Updates part of an existing book.
- Example request body:
  
```json
  {
    "year": 1970
  }
  ```

- Success status: `200 OK`

Delete a book
- Method: DELETE
- Path: `/books/{id}`
- Description: Removes a book from the library.
- Request body: None
- Success status: `204 No Content`

List books by author
- Method: GET
- Path: `/books?author={author-name}`
- Description: Returns only books written by the author named in the query parameter.
- Example: `/books?author=Ursula%20K.%20Le%20Guin`
- Request body: None
- Success status: `200 OK`

Error codes

- 400 Bad Request: The request is malformed or missing required fields. Example: sending `POST /books` with a JSON body of `{ "author": "Octavia Butler" }` but no `title` field.
- 404 Not Found: The requested book does not exist. Example: sending `GET /books/999` when no book has ID `999`.