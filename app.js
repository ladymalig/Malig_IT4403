$(document).ready(function() {
    $('#search-btn').click(function() {
        const searchTerm = $('#search-term').val().trim();
        if (searchTerm) {
            searchBooks(searchTerm);
        } else {
            alert('Please enter a search term');
        }
    });

    displayPublicBookshelf(); 
});

function searchBooks(searchTerm) {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const apiUrl1 = `https://www.googleapis.com/books/v1/volumes?q=${encodedSearchTerm}&maxResults=40`;
    const apiUrl2 = `https://www.googleapis.com/books/v1/volumes?q=${encodedSearchTerm}&startIndex=40&maxResults=10`;

    $.ajax({
        url: apiUrl1,
        type: 'GET',
        success: function(data1) {
            if (data1.items && data1.items.length > 0) {
                if (data1.totalItems > 40) {
                    $.ajax({
                        url: apiUrl2,
                        type: 'GET',
                        success: function(data2) {
                            const combinedResults = data1.items.concat(data2.items);
                            displaySearchResults(combinedResults);
                            setupPagination(combinedResults);
                        },
                        error: function() {
                            alert('An error occurred while fetching additional data from Google Books API.');
                        }
                    });
                } else {
                    displaySearchResults(data1.items);
                    setupPagination(data1.items);
                }
            } else {
                $('#results').empty();
                $('#pagination').empty();
                alert('No books found for the given search term.');
            }
        },
        error: function() {
            alert('An error occurred while fetching data from Google Books API.');
        }
    });
}

function displaySearchResults(books, startIndex = 0) {
    const resultsDiv = $('#results');
    resultsDiv.empty();

    const booksContainer = $('<div class="books-container"></div>');
    
    books.slice(startIndex, startIndex + 10).forEach(book => {
        const title = book.volumeInfo.title || 'No title available';
        const thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'no_image.png';

        const bookItem = `
            <div class="book-item">
                <img src="${thumbnail}" alt="${title}">
                <h3>${title}</h3>
                <button class="details-btn" data-id="${book.id}">View Details</button>
                <div class="book-details" style="display: none;"></div>
            </div>
        `;
        booksContainer.append(bookItem);
    });

    resultsDiv.append(booksContainer);

    $('#results').off('click').on('click', '.details-btn', function() {
        const bookId = $(this).data('id');
        const bookItemDiv = $(this).closest('.book-item');
        showBookDetailsUnder(bookId, bookItemDiv);
    });
}

function setupPagination(books) {
    const paginationDiv = $('#pagination');
    paginationDiv.empty();

    const totalPages = Math.ceil(books.length / 10);
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = `<button class="page-btn" data-page="${i}">${i}</button>`;
        paginationDiv.append(pageButton);
    }

    $('#pagination').off('click').on('click', '.page-btn', function() {
        const pageNumber = $(this).data('page');
        const startIndex = (pageNumber - 1) * 10;
        displaySearchResults(books, startIndex);
    });
}

$(document).ready(function() {
    $('#bookshelf-section').hide();

    $('#bookshelf-btn').click(function() {
        $('#bookshelf-section').slideToggle();
        
        if (!$(this).data('loaded')) {
            loadBookshelf();
            $(this).data('loaded', true);
        }
    });
});

function loadBookshelf() {
    const apiUrl = 'https://www.googleapis.com/books/v1/users/101245217956101178977/bookshelves/0/volumes';

    $.ajax({
        url: apiUrl,
        type: 'GET',
        success: function(data) {
            const books = data.items;
            displayPublicBookshelf(books);
        },
        error: function() {
            alert('An error occurred while fetching your public bookshelf.');
        }
    });
}

function displayPublicBookshelf(books) {
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

    $('#bookshelf').on('click', '.details-btn', function() {
        const bookId = $(this).data('id');
        const bookItemDiv = $(this).closest('.book-item');
        showBookDetailsUnder(bookId, bookItemDiv);
    });
}

function showBookDetailsUnder(bookId, bookItemDiv) {
    const bookDetailsDiv = bookItemDiv.find('.book-details');

    if (bookDetailsDiv.is(':visible')) {
        bookDetailsDiv.slideUp();
    } else {
        const apiUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function(book) {
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
            error: function() {
                alert('An error occurred while fetching book details.');
            }
        });
    }
}
