const btnSearch = document.querySelector(".search__button");
btnSearch.addEventListener("click", handleSearchBar);
const loader = document.getElementById("list__loader");

const itemName = "theLibraryMyFavedBooks";
displayFavedBooks(readFavedBooks());

async function handleSearchBar(e) {
  const searchBar = document.querySelector(".search__input");
  if (!searchBar.value) {
    console.log("provide search phrase");
    throw new Error("no search phrase provided", { cause: err });
  }
  const query = searchBar.value.replaceAll(" ", "%20");
  const url = `https://openlibrary.org/search.json?q=${query}&limit=8`;
  const headers = new Headers({
    "User-Agent": "TheLibrary/0.1",
  });
  const options = {
    method: "GET",
    headers: headers,
  };

  setLoading(true);
  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      createBooksCards(data.docs);
      setLoading(false);
    })
    .catch((error) => console.error("Error:", error));
}

function createBooksCards(booksArray, size) {
  // if (!booksArray || booksArray.length === 0) {
  //   throw new Error("no books found", { cause: err });
  // }

  let booksList = null;
  if (size && size === "small") {
    booksList = document.querySelector(".sidebar");
  } else {
    booksList = document.querySelector(".books__list");
  }

  booksList.innerHTML = `<li>loading books</li>`;
  booksList.innerHTML = ``;
  const bookCards = booksArray.map((el) => {
    const coverurl = size
      ? el.coverurl
      : `https://covers.openlibrary.org/b/id/${el.cover_i}.jpg`;
    const author = size ? el.author : el.author_name.join(", ");

    const favedClass = ".book-card__icon--faved"

    booksList.innerHTML += `
       <li class="book-card"
       data-title="${el.title}" 
       data-author="${author}"
       data-first_publish_year="${el.first_publish_year}"
       data-coverurl="https://covers.openlibrary.org/b/id/${el.cover_i}.jpg">
        <button class="book-card__fave-button">

          <img class="book-card__icon" src="./src/assets/heart.svg" alt="heart icon">
        </button>

          <img class="book-card__image" src="${coverurl}">
          <h3 class="book-card__title">${el.title}</h3>
          <p class="book-card__author">${author}</p>
          <p class="book-year">${el.first_publish_year}</p>
        </li>
    `; // template literal ends here!
  });
  booksList
    .querySelectorAll(".book-card__fave-button")
    .forEach((el) => el.addEventListener("click", (e) => faveTheBook(e)));
}
function faveTheBook(e) {
  console.log("initialized faving");

  let myFavedBooks = readFavedBooks();
  localStorage.removeItem(itemName);
  console.log("my books: ", myFavedBooks);

  const newFavedBook = {
    title: e.target.parentElement.dataset.title,
    author: e.target.parentElement.dataset.author,
    first_publish_year: e.target.parentElement.dataset.first_publish_year,
    coverurl: e.target.parentElement.dataset.coverurl,
  };
  const isAlreadyStored = myFavedBooks.findIndex((book) => {
    console.log("comparing faves");
    return (
      book.title === newFavedBook.title &&
      book.author === newFavedBook.author &&
      book.first_publish_year === newFavedBook.first_publish_year
    );
  });
  console.log(isAlreadyStored);

  if (isAlreadyStored !== -1) {
    console.log("unfaving");
    myFavedBooks.splice(isAlreadyStored, 1);
  } else {
    myFavedBooks.push(newFavedBook);
  }
  localStorage.setItem(itemName, JSON.stringify(myFavedBooks));
  displayFavedBooks(readFavedBooks());
}

function readFavedBooks() {
  let myFavedBooks = [];
  if (localStorage.getItem(itemName)) {
    myFavedBooks = [...JSON.parse(localStorage.getItem(itemName))];
  }
  return myFavedBooks;
}

function displayFavedBooks(booksArray) {
  createBooksCards(booksArray, "small");
}
function setLoading(isLoading) {
  if (isLoading) {
    document.querySelector(".books__list").innerHTML = "";

    loader.style.display = "block";

    console.log("loading books");
  } else if (!isLoading) {
    loader.style.display = "none";

    console.log("books loaded");
  }
}

//to filter by author lets gather all displayed authors and create buttons with their names
// once button is clicked all book-cards are hidden except those that realte to the clicked button
