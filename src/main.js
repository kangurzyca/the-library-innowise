const btnSearch = document.querySelector(".search__button");
btnSearch.addEventListener("click", handleSearchBar);

const loader = document.getElementById("list__loader");
const itemName = "theLibraryMyFavedBooks";

//display faves in a sidebar if they exist
createBooksCards(readFavedBooks(), "small");

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

    const favedClass = size ? "book-card__icon--faved" : ""

    booksList.innerHTML += `
       <li class="book-card"
       data-title="${el.title}" 
       data-author="${author}"
       data-first_publish_year="${el.first_publish_year}"
       data-coverurl="https://covers.openlibrary.org/b/id/${el.cover_i}.jpg">
          <button class="book-card__fave-button">
            <img class="book-card__icon ${favedClass}" src="./src/assets/heart.svg" alt="heart icon">
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

    // checking if fetched books contain already faved ones
  const favedBooks = readFavedBooks()
  booksList.querySelectorAll("li").forEach(li=>{ //iterate over booksList items
    favedBooks.forEach(book=>{ //for each booksList item iterate over faved
      if(book.title === li.dataset.title && // check if there is a match
      book.author === li.dataset.author &&
      book.first_publish_year === li.dataset.first_publish_year){
        li.querySelector(".book-card__icon").classList.add("book-card__icon--faved") // add a faved class
      }
    })
  })

}
function faveTheBook(e) {
  // get faved books from localStorage
  let myFavedBooks = readFavedBooks();
  //remove item from localStorage before its updated and stored back
  localStorage.removeItem(itemName);

  //get data from a li element of booked to be faved
  const newFavedBook = {
    title: e.target.parentElement.dataset.title,
    author: e.target.parentElement.dataset.author,
    first_publish_year: e.target.parentElement.dataset.first_publish_year,
    coverurl: e.target.parentElement.dataset.coverurl,
  };
  // check if book to be faved is already stored in localStorage
  const isAlreadyStored = myFavedBooks.findIndex((book) => {
    return (
      book.title === newFavedBook.title &&
      book.author === newFavedBook.author &&
      book.first_publish_year === newFavedBook.first_publish_year
    );
  });

  //deciding whether to fave or not basing on findIndex return value => -1 if not found or actuall item index
  if (isAlreadyStored !== -1) {
    myFavedBooks.splice(isAlreadyStored, 1);
    e.target.querySelector("img").classList.remove("book-card__icon--faved");
  } else {
    myFavedBooks.push(newFavedBook);
    e.target.querySelector("img").classList.add("book-card__icon--faved");
  }
  //setting updated item in localStorage
  localStorage.setItem(itemName, JSON.stringify(myFavedBooks));
  // rerendering aside faved list
  createBooksCards(readFavedBooks(), "small")
}

function readFavedBooks() {
  let myFavedBooks = [];
  if (localStorage.getItem(itemName)) {
    myFavedBooks = [...JSON.parse(localStorage.getItem(itemName))];
  }
  return myFavedBooks;
}

// laoding state function
function setLoading(isLoading) {
  if (isLoading) {
    //delete current booksList if a new search is called
    document.querySelector(".books__list").innerHTML = "";
    //show a loader message
    loader.style.display = "block";
  } else if (!isLoading) {
    //hide loading message
    loader.style.display = "none";
  }
}

//to filter by author lets gather all displayed authors and create buttons with their names
// once button is clicked all book-cards are hidden except those that realte to the clicked button
