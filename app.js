
$(document).ready(function () {
    const API_URL = "https://www.googleapis.com/books/v1/volumes?q=";
    let searchResults = [];
    let bookshelfLoaded = false;

    console.log("app.js loaded");

    // Search functionality
    $('#search-btn').click(function () {
        const searchTerm = $('#search-term').val().trim();
        console.log("Search button clicked. Search term:", searchTerm);
        if (searchTerm) {
            searchBooks(searchTerm);
        } else {
            alert('Please enter a search term');
        }
    });

    // Toggle bookshelf visibility
    $('#bookshelf-btn').click(function () {
        $('#bookshelf-section').slideToggle();

        if (!bookshelfLoaded) {
            loadBookshelf();
            bookshelfLoaded = true;
        }
    });

    // Load public bookshelf
    function loadBookshelf() {
        const apiUrl = 'https://www.googleapis.com/books/v1/users/101245217956101178977/bookshelves/0/volumes';

        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function (data) {
                const books = data.items || [];
                displayBookshelf(books);
            },
            error: function () {
                alert('An error occurred while fetching your public bookshelf.');
            }
        });
    }

    // Display bookshelf
    function displayBookshelf(books) {
        const bookshelfDiv = $('#bookshelf');
        bookshelfDiv.empty();

        books.forEach(book => {
            const title = book.volumeInfo.title || 'No title available';
            const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'no_image.png';

            const bookItem = `
                <div class="book-item" data-id="${book.id}">
                    <img src="${thumbnail}" alt="${title}">
                    <h3>${title}</h3>
                    <button class="details-btn" data-id="${book.id}">View Details</button>
                    <div class="book-details" style="display: none;"></div>
                </div>
            `;
            bookshelfDiv.append(bookItem);
        });

        // Attach click event for book details
        $('#bookshelf').off('click').on('click', '.details-btn', function () {
            const bookId = $(this).data('id');
            const bookItemDiv = $(this).closest('.book-item');
            showBookDetailsUnder(bookId, bookItemDiv);
        });
    }

    // Search books
    function searchBooks(searchTerm) {
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        const apiUrl = `${API_URL}${encodedSearchTerm}&maxResults=40`;

        console.log("API URL:", apiUrl);

        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function (data) {
                if (data.items && data.items.length > 0) {
                    searchResults = data.items;
                    displaySearchResults(searchResults);
                    setupPagination(searchResults);
                } else {
                    $('#search-results').empty();
                    $('#pagination').empty();
                    alert('No books found for the given search term.');
                }
            },
            error: function () {
                alert('An error occurred while fetching data from the Google Books API.');
            }
        });
    }

    // Display search results
    function displaySearchResults(books, startIndex = 0) {
        const resultsDiv = $('#search-results');
        resultsDiv.empty();

        const template = $("#grid-template").html();
        const displayedBooks = books.slice(startIndex, startIndex + 10).map(book => ({
            id: book.id,
            title: book.volumeInfo.title || 'No title available',
            author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author',
            thumbnail: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'no_image.png'
        }));

        console.log("Template content:", template);
        console.log("Books to display:", displayedBooks);

        try {
            const rendered = Mustache.render(template, { books: displayedBooks });
            console.log("Rendered HTML:", rendered);
            resultsDiv.html(rendered);
        } catch (error) {
            console.error("Error rendering Mustache template:", error);
            alert("An error occurred while rendering the search results.");
        }

        // Attach click event for book details
        $('#search-results').off('click').on('click', '.details-btn', function () {
            const bookId = $(this).data('id');
            const bookItemDiv = $(this).closest('.book-item');
            showBookDetailsUnder(bookId, bookItemDiv);
        });
    }

    // Setup pagination
    function setupPagination(books) {
        const paginationDiv = $('#pagination');
        paginationDiv.empty();

        const totalPages = Math.ceil(books.length / 10);
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = `<button class="page-btn" data-page="${i}">${i}</button>`;
            paginationDiv.append(pageButton);
        }

        $('#pagination').off('click').on('click', '.page-btn', function () {
            const pageNumber = $(this).data('page');
            const startIndex = (pageNumber - 1) * 10;
            displaySearchResults(books, startIndex);
        });
    }

    // Show book details under clicked book item
    function showBookDetailsUnder(bookId, bookItemDiv) {
        const bookDetailsDiv = bookItemDiv.find('.book-details');

        if (bookDetailsDiv.is(':visible')) {
            bookDetailsDiv.slideUp();
        } else {
            const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

            $.ajax({
                url: apiUrl,
                type: 'GET',
                success: function (book) {
                    const title = book.volumeInfo.title || 'No title available';
                    const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author';
                    const description = book.volumeInfo.description || 'No description available.';
                    const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'no_image.png';

                    const bookDetails = `
                        <div class="book-details-content">
                            <p><strong>Authors:</strong> ${authors}</p>
                            <p><strong>Description:</strong> ${description}</p>
                        </div>
                    `;

                    bookDetailsDiv.html(bookDetails);
                    bookDetailsDiv.slideDown();
                },
                error: function () {
                    alert('An error occurred while fetching book details.');
                }
            });
        }
    }
});


