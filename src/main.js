//get theme button
const btnTheme = document.querySelector(".header__theme-button");
const themeName = "theLibrarySelectedTheme";

btnTheme.addEventListener("click", ()=>setTheme(true));
//set theme basing on localstorage or default
setTheme()

// selecting the seartch button
const btnSearch = document.querySelector(".search__button");
btnSearch.addEventListener("click", handleSearchBar);

//available books number
let availableAmount = 0;
// query placeholder
let searchQuery = null;
let queryOffset = 0;

// declaring debounce variable for on-the-fly search
let debounceTimeout;

//selectind search bar input field and making it input sensitive to lock search button in case of no input
//openLIbrary lock request for searches shorter than three characters
const searchBar = document.querySelector(".search__input");
searchBar.addEventListener("input", (e) => {
  if (e.target.value.length > 2) {
    btnSearch.disabled = false;
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      //remove filters created during previous search
      document
        .querySelectorAll(".filters__author-filter")
        .forEach((el) => el.remove());

      handleSearchBar();
    }, 1000);
  } else {
    // added debouncer
    btnSearch.disabled = true;
    return;
  }
});

// getting a placeholder pargraph that serves as a state broadcaster
const booksMessage = document.getElementById("books__message");
const itemName = "theLibraryMyFavedBooks";

//display faves in a sidebar if they exist
createBooksCards(readFavedBooks(), "small");

async function handleSearchBar(queryArg) {
  if (!queryArg) {
    availableAmount = 0;
    queryOffset = 0;
    searchQuery = null;
  }
  setLoading(true);
  try {
    if (!searchBar.value && !queryArg) {
      throw new Error("No search phrase provided.");
    }

    // if moreButton is clicked then modified old query is passed and used in URL
    let url = null;
    if (queryArg) {
      url = `https://openlibrary.org/search.json?q=${queryArg}`;
    } else {
      searchQuery = `${searchBar.value.replaceAll(" ", "+")}&limit=9`;
      url = `https://openlibrary.org/search.json?q=${searchQuery}`;
    }

    const headers = new Headers({
      "User-Agent": "TheLibrary/0.1",
    });
    const options = {
      method: "GET",
      headers: headers,
    };
    const response = await fetch(url, options);
    if (!response.ok) {
      setLoading(false, "network");
      throw new Error("Request failed due to network error");
    }
    const data = await response.json();

    if (data.docs.length === 0) {
      setLoading(false, "no books");
      return;
    }
    availableAmount = data.numFound;

    //create book-cards basing on new search vs offset search
    if (queryArg) {
      createBooksCards(data.docs, undefined, true);
    } else {
      createBooksCards(data.docs);
    }
    // for main books list adding filtering buttons
    createAuthorFilters();

    setLoading(false);
    searchBar.value = "";
    //button should be disabled now
    btnSearch.disabled = true;
  } catch (error) {
    setLoading(false);
    console.error("error fetching data", error);
  } finally {
  }
}


function createBooksCards(booksArray, size, addBooks) {
  // early return if no books data available
  if (!booksArray || booksArray.length === 0) {
    document.querySelectorAll(".sidebar__list li").forEach((el) => el.remove());
    return;
  }

  // addMore button should be delted
  document.querySelector(".list__button-more")?.remove();
  // adding classes depending on where a book-card goes
  let booksList = null;
  let bookCardClass = null;
  if (size && size === "small") {
    booksList = document.querySelector(".sidebar__list");
    bookCardClass = "book-card book-card--small";
  } else {
    booksList = document.querySelector(".books__list");
    bookCardClass = "book-card";
  }
  if (!addBooks) {
    booksList.querySelectorAll("li").forEach((li) => li.remove());
  }

  const bookCards = booksArray.map((el) => {
    // checking for data pieces to be falsey
    // asdfasdf - returns a book with no author and breaks .join() below
    let coverurl = null;
    let author = null;
    let title = null;
    let first_publish_year = null;
    if (size) {
      if (el.coverurl) {
        coverurl = el.coverurl;
      } else {
        coverurl = "no URL";
      }
      if (el.author) {
        author = el.author;
      } else {
        author = "no author";
      }
      if (el.title) {
        title = el.title;
      } else {
        title = "no title";
      }
      if (el.first_publish_year) {
        first_publish_year = el.first_publish_year;
      } else {
        first_publish_year = "no year";
      }
    } else {
      if (el.cover_i) {
        coverurl = `https://covers.openlibrary.org/b/id/${el.cover_i}.jpg`;
      } else {
        coverurl = "no URL";
      }
      if (el.author_name) {
        author = el.author_name.join(", ");
      } else {
        author = "no author";
      }
      if (el.title) {
        title = el.title;
      } else {
        title = "no title";
      }
      if (el.first_publish_year) {
        first_publish_year = el.first_publish_year;
      } else {
        first_publish_year = "no year";
      }
    }

    const favedClass = size ? "book-card__icon--faved" : "";

    booksList.innerHTML += `
       <li class="${bookCardClass}"
       data-title="${el.title}" 
       data-author="${author}"
       data-first_publish_year="${el.first_publish_year}"
       data-coverurl="${coverurl}">
          <div class="book-card__cover">
            <img class="book-card__image" src="${coverurl}" alt="cover of ${el.title}">
          </div>
          <div class="book-card__text-wrapper">
            <h3 class="book-card__title">${el.title}</h3>
            <p class="book-card__author">${author}</p>
            <p class="book-card__year">${el.first_publish_year}</p>
          </div>
          <button class="book-card__fave-button"   aria-label="Add to favourites">
            <svg class="book-card__icon ${favedClass}" viewBox="-1 -1 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6667 9.33333C13.66 8.36 14.6667 7.19333 14.6667 5.66667C14.6667 4.69421 14.2804 3.76158 13.5928 3.07394C12.9051 2.38631 11.9725 2 11 2C9.82671 2 9.00004 2.33333 8.00004 3.33333C7.00004 2.33333 6.17337 2 5.00004 2C4.02758 2 3.09495 2.38631 2.40732 3.07394C1.71968 3.76158 1.33337 4.69421 1.33337 5.66667C1.33337 7.2 2.33337 8.36667 3.33337 9.33333L8.00004 14L12.6667 9.33333Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </li>
    `; // template literal ends here!
  });
  booksList
    .querySelectorAll(".book-card__fave-button")
    .forEach((el) => el.addEventListener("click", (e) => faveTheBook(e)));

  // if books had no defined book cover then remove the image from the book-card cover
  // div will be left acting as a book cover placeholder
  booksList.querySelectorAll('img[src="no URL"]').forEach((el) => el.remove());

  // checking if fetched books contain already faved ones
  const favedBooks = readFavedBooks();
  booksList.querySelectorAll("li").forEach((li) => {
    //iterate over booksList items
    favedBooks.forEach((book) => {
      //for each booksList item iterate over faved
      if (
        book.title === li.dataset.title && // check if there is a match
        book.author === li.dataset.author &&
        book.first_publish_year === li.dataset.first_publish_year
      ) {
        // add a faved class
        li.querySelector(".book-card__icon").classList.add(
          "book-card__icon--faved",
        );
        // update aria label
        li.querySelector(".book-card__fave-button").ariaLabel =
          "Remove form favorites";
      }
    });
  });

  // create addMore button if there are more books
  if (booksArray.length < availableAmount) {
    createMoreButton(searchQuery);
  }
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
    e.target
      .querySelector(".book-card__icon")
      .classList.remove("book-card__icon--faved");

    //updating aria label
    e.target.ariaLabel = "add to favorites";

    // //unfortunately one has to search over books that are displayed in books__list to unfave them on the go
    const DisplayedFavedBooks = document.querySelectorAll(
      ".books__list .book-card",
    );
    DisplayedFavedBooks.forEach((book) => {
      if (
        book.dataset.title === newFavedBook.title &&
        book.dataset.author === newFavedBook.author &&
        book.dataset.first_publish_year === newFavedBook.first_publish_year
      ) {
        book
          .querySelector(".book-card__icon")
          .classList.remove("book-card__icon--faved");
        //update aria
        book.querySelector(".book-card__fave-button").ariaLabel =
          "Add to favorites";
      }
    });
    // // get iterate over them and check for data and unfave if needed.
  } else {
    myFavedBooks.push(newFavedBook);
    e.target
      .querySelector(".book-card__icon")
      .classList.add("book-card__icon--faved");
    //update aria
    e.target.ariaLabel = "remove from favorites";
  }
  //setting updated item in localStorage
  localStorage.setItem(itemName, JSON.stringify(myFavedBooks));
  // rerendering aside faved list
  createBooksCards(readFavedBooks(), "small");
}

function readFavedBooks() {
  let myFavedBooks = [];
  if (localStorage.getItem(itemName)) {
    myFavedBooks = [...JSON.parse(localStorage.getItem(itemName))];
  }
  countFavorites(myFavedBooks);
  return myFavedBooks;
}

// laoding state function
function setLoading(isLoading, type) {
  const moreButton = document.querySelector(".list__button-more");

  if (isLoading) {
    //show a booksMessage message
    booksMessage.style.display = "block";
    booksMessage.textContent = "Loading books, please wait.";
    btnSearch.disabled = true;
    if (moreButton) {
      moreButton.disabled = true;
      moreButton.textContent = "loading...";
    }
  } else if (!isLoading && !type) {
    //hide loading message
    booksMessage.style.display = "none";
    btnSearch.disabled = false;
    if (moreButton) {
      moreButton.disabled = false;
      moreButton.textContent = "load more";
    }
  } else if (!isLoading && type === "no books") {
    booksMessage.style.display = "block";
    booksMessage.textContent =
      "No books found, try searching for something else.";
    btnSearch.disabled = false;
    if (moreButton) {
      moreButton.disabled = false;
      moreButton.textContent = "load more";
    }
  } else if (!isLoading && type === "network") {
    booksMessage.style.display = "block";
    booksMessage.textContent =
      "Search failed due to network error, please try again.";
    btnSearch.disabled = false;
    if (moreButton) {
      moreButton.textContent = "load more";
      moreButton.disabled = false;
    }
  }
}

//to filter by author lets gather all displayed authors and create buttons with their names
// once button is clicked all book-cards are hidden except those that realte to the clicked button
function createAuthorFilters() {
  document
    .querySelectorAll(".filters__author-filter")
    .forEach((el) => el.remove());

  const booksList = document.querySelectorAll(".books__list li");

  //return if empty or undefined
  if (!booksList || Array.from(booksList).length === 0) {
    console.log("no filters created due to no books available");
    return;
  }

  //make an array from querySelectorAll output
  const booksArray = Array.from(booksList);

  //get filters block
  const filtersBlock = document.querySelector(".books__filters");

  //go over booksArray and push an author to authorsArray
  let authorsArray = booksArray.map((book, index, array) => {
    //check for duplicates in original array by finding a first index of author occurance
    //if the found index is not the same as index of an author currently mapped over then it is a duplicate
    const isDuplicate =
      array.findIndex((el) => el.dataset.author === book.dataset.author) !==
      index;
    if (isDuplicate) {
      return;
    }
    return book.dataset.author;
  });
  //removing undefined created by early return from map()
  //using Boolean() function to differnetiate valid strings from falsey values => undefined's
  authorsArray = authorsArray.filter(Boolean);

  //filtering only one author doesn't make sense => early return
  if (authorsArray.length < 2) {
    return;
  }

  //create buttons with author names
  const buttonsArray = authorsArray.map((author) => {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("filters__author-filter", "button");
    button.value = author;
    button.textContent = author;
    button.dataset.selected = "false";

    // adding an EvenListener to the button
    button.addEventListener("click", (e) => {
      //getting all book from a booklist omitting getting the sidebar book-cards
      const allOtherBooks = document.querySelectorAll(
        `.books__list .book-card`,
      );
      allOtherBooks.forEach((el) => el.classList.add("book-card--hidden"));

      //having target value I can select all list items with this value within dataset
      const matchedBooks = document.querySelectorAll(
        `[data-author="${e.target.value}"]`,
      );

      // changing button selected state
      if (e.target.dataset.selected === "false") {
        e.target.dataset.selected = "true";
        e.target.classList.add("filters__author-filter--selected");
      } else if (e.target.dataset.selected === "true") {
        e.target.dataset.selected = "false";
        e.target.classList.remove("filters__author-filter--selected");
      }

      // every time I click a button I have to check which buttons are selected.
      const selectedButtons = Array.from(
        document.querySelectorAll("[data-selected='true']"),
      ).map((el) => el.value);

      //when no filters are selected then display all books
      if (selectedButtons.length === 0) {
        allOtherBooks.forEach((el) => el.classList.remove("book-card--hidden"));
      }

      // having a list of selected authors I can hide all books that are not on the list
      // iterating over two arrays
      selectedButtons.forEach((btn) => {
        allOtherBooks.forEach((book) => {
          if (btn === book.dataset.author) {
            book.classList.remove("book-card--hidden");
          }
        });
      });
    });
    filtersBlock.appendChild(button);
  });
}
function countFavorites(array) {
  const counter = document.querySelector(".sidebar__counter");

  if (array.length === 0) {
    counter.textContent = "No books saved";
  } else if (array.length === 1) {
    counter.textContent = "1 book saved";
  } else {
    counter.textContent = `${array.length.toString()} books saved`;
  }
}
function createMoreButton(searchPhrase) {
  queryOffset += 9;
  //create a search query
  const newQuery = `${searchPhrase}&offset=${queryOffset}`;

  //if queryOffset is bigger than availableAmount limit the ofset to the amount
  if (queryOffset > availableAmount) {
    queryOffset = availableAmount;
  }

  // early return if no more books to fetch
  if (queryOffset >= availableAmount) {
    return;
  }

  const booksList = document.querySelector(".books__list");
  const moreButton = document.createElement("button");
  moreButton.type = "button";
  moreButton.textContent = "load more";
  moreButton.ariaLabel = "load more books";
  moreButton.addEventListener("click", () => {
    // invoke handleSearch passing new query with an offset
    handleSearchBar(newQuery);
  });
  moreButton.classList.add("list__button-more", "book-card");
  booksList.appendChild(moreButton);
}

function setTheme(toggle = false) {

    // getting saved theme from local storage or if undefined then set the default value
    let myTheme = JSON.parse(localStorage.getItem(themeName)) || "light";

    // if toggled via eventListener then switch themes
    if (toggle) {
      if(myTheme === "light"){
      myTheme = "dark"
      }else{
      myTheme = "light"
      }
    }

    //lastly set the theme
    if (myTheme === "dark") {
        document.body.classList.add("theme-dark");
        btnTheme.textContent = "light";
    } else {
        document.body.classList.remove("theme-dark");
        btnTheme.textContent = "dark";
    }
    // set/update the item in local storage
    localStorage.setItem(themeName, JSON.stringify(myTheme));
}