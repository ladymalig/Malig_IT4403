$(document).ready(function () {
    var currentSearchTerm = '';  

    $('#search-btn').click(function () {
        currentSearchTerm = $('#search-term').val().trim();  

        if (!currentSearchTerm) {
            $('#results').html('<p>Please enter a search term.</p>');
            return;
        }

        fetchBooks(currentSearchTerm, 0);
    });

    $('#pages').change(function () {
        var selectedPage = $(this).val();
        fetchBooks(currentSearchTerm, selectedPage);
    });

    function fetchBooks(searchTerm, startIndex) {
        var url = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&startIndex=${startIndex}&maxResults=40`;
        console.log("Search URL: ", url);

        $('#results').html('<p>Loading results...</p>');

        $.getJSON(url, function (data) {
            var results = '';
            if (data.items && data.items.length > 0) {
                $.each(data.items, function (index, book) {
                    var bookId = book.id;
                    var title = book.volumeInfo.title;
                    var author = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'No author information';
                    var publisher = book.volumeInfo.publisher ? book.volumeInfo.publisher : 'No publisher information';
                    var thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : 'https://via.placeholder.com/128x192.png?text=No+Image';

                    results += `<div class="book-result">
                                    <img src="${thumbnail}" alt="${title}">
                                    <div>
                                        <h3>${title}</h3>
                                        <p><strong>Author:</strong> ${author}</p>
                                        <p><strong>Publisher:</strong> ${publisher}</p>
                                        <a href="bookinfo.html?id=${bookId}" class="button">More Info</a>
                                    </div>
                                </div>`;
                });
                $('#results').html(results);
            } else {
                $('#results').html('<p>No results found</p>');
            }
        }).fail(function () {
            $('#results').html('<p>Error fetching data. Please try again later.</p>');
        });
    }

    function fetchBookshelf() {
        var bookshelfUrl = `https://www.googleapis.com/books/v1/users/101245217956101178977/bookshelves/1001/volumes`;

        console.log("Fetching from: ", bookshelfUrl);

        $('#bookshelf-results').html('<p>Loading bookshelf...</p>');

        $.getJSON(bookshelfUrl, function (data) {
            var results = '';
            if (data.items && data.items.length > 0) {
                $.each(data.items, function (index, book) {
                    var bookId = book.id;
                    var title = book.volumeInfo.title;
                    var author = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'No author information';
                    var publisher = book.volumeInfo.publisher ? book.volumeInfo.publisher : 'No publisher information';
                    var thumbnail = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : 'https://via.placeholder.com/128x192.png?text=No+Image';

                    results += `<div class="book-result">
                                    <img src="${thumbnail}" alt="${title}">
                                    <div>
                                        <h3>${title}</h3>
                                        <p><strong>Author:</strong> ${author}</p>
                                        <p><strong>Publisher:</strong> ${publisher}</p>
                                        <a href="bookinfo.html?id=${bookId}" class="button">More Info</a>
                                    </div>
                                </div>`;
                });
                $('#bookshelf-results').html(results);
            } else {
                $('#bookshelf-results').html('<p>No books found on this shelf.</p>');
            }
        }).fail(function () {
            $('#bookshelf-results').html('<p>Error fetching bookshelf data. Please try again later.</p>');
        });
    }

    if (window.location.pathname.includes('bookshelf.html')) {
        fetchBookshelf();
    }

    if (window.location.pathname.includes('bookinfo.html')) {
        var urlParams = new URLSearchParams(window.location.search);
        var bookId = urlParams.get('id');

        if (!bookId) {
            $('#book-details').html('<p>Error: Book ID not found. Please try again.</p>');
            return;
        }

        console.log("Book ID from URL: ", bookId);

        var url = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

        console.log("Book Details URL: ", url);

        $.getJSON(url, function (data) {
            var details = `<h2>${data.volumeInfo.title}</h2>
                           <p><strong>Authors:</strong> ${data.volumeInfo.authors ? data.volumeInfo.authors.join(', ') : 'N/A'}</p>
                           <p><strong>Publisher:</strong> ${data.volumeInfo.publisher ? data.volumeInfo.publisher : 'N/A'}</p>
                           <p><strong>Published Date:</strong> ${data.volumeInfo.publishedDate ? data.volumeInfo.publishedDate : 'N/A'}</p>
                           <p><strong>Description:</strong> ${data.volumeInfo.description ? data.volumeInfo.description : 'No description available'}</p>
                           <p><strong>Page Count:</strong> ${data.volumeInfo.pageCount ? data.volumeInfo.pageCount : 'N/A'}</p>
                           <p><strong>Categories:</strong> ${data.volumeInfo.categories ? data.volumeInfo.categories.join(', ') : 'N/A'}</p>
                           <p><strong>Average Rating:</strong> ${data.volumeInfo.averageRating ? data.volumeInfo.averageRating : 'No rating available'}</p>
                           <img src="${data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128x192.png?text=No+Image'}" alt="${data.volumeInfo.title}">`;
            $('#book-details').html(details);
        }).fail(function () {
            $('#book-details').html('<p>Error fetching book details. Please try again later.</p>');
        });
    }
});
