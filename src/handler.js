const { nanoid } = require('nanoid');
const bookshelf =  require('./books');

const addBooksHandler = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

    //Buku gagal ditambahkan
    if (name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });

        response.code(400);
        return response;
    }

    //Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });

        response.code(400);
        return response;
    }

    //buku berhasil ditambahkan
    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;
    const book = 
    {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
    };

    bookshelf.push(book);
    
    const isSuccess = bookshelf.filter(
        (book) => book.id === id)
        .length > 0;

    if (isSuccess) {
        const response = h.response({
            status : 'success',
            message : 'Buku berhasil ditambahkan',
            data : {
                bookId : id,
            },
        });

        response.code(201);
        return response;
    }

    //error server
    const response = h.response({
        status : 'error',
        message : 'Buku gagal ditambahkan',
    });

    response.code(500);
    return response;
};

const getAllBooksHandler = (request, h) => {
    const {
        name,
        reading,
        finished,
    } = request.query;
    let booksToReturn = [...bookshelf]

    if (name !== undefined) {
        const namaBuku = name.toLowerCase();
        booksToReturn = booksToReturn.filter((book) => book.name.toLowerCase().includes(namaBuku));
    } 
    
    if (reading !== undefined) {
        booksToReturn = booksToReturn.filter((book) => Number(book.reading) === Number(reading));
    }

    if (finished !== undefined) {
        booksToReturn = booksToReturn.filter((book) => book.finished ===finished);
    }

    const response = h.response({
            status : 'success',
            data : {
                books: booksToReturn.map((books) => ({
                    id : books.id,
                    name : books.name,
                    publisher : books.publisher,
                })),
            },
        });

        response.code(200);
        return response;

};

const getBooksByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const book = bookshelf.find(
        (book) => book.id === bookId);

    if (book !== undefined) {
       const response = h.response({
        status : 'success',
        data : {
           book, 
       },
       });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    });

    response.code(404);
    return response;
};

const editBooksHandler = (request, h) => {
    const { bookId } = request.params;
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

    if (name === undefined){
        const response = h.response({
            status : 'fail',
            message : 'Gagal memperbarui buku. Mohon isi nama buku'
        });

        response.code(400);
        return response;
    }

    //Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
   if (readPage > pageCount) {
   const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });

    response.code(400);
    return response;
    }

    //Status buku ketika diupdate
    const finished = (pageCount === readPage);
    const updatedAt = new Date().toISOString();
    const index = bookshelf.findIndex(
        (book) => book.id === bookId);

    if (index !== -1) {
        const updatedBook = {
        ...bookshelf[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        updatedAt,
    };

    bookshelf[index] = updatedBook;

    const response = h.response({
        status : 'success',
        message : 'Buku berhasil diperbarui',
    });

    response.code(200);
    return response;
    }

    const response = h.response({
        status : 'fail',
        message : 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};

const deleteBooksHandler = (request, h) => {
    const { bookId } = request.params;
    const index = bookshelf.findIndex(
        (book) => book.id === bookId);
    
    if (index !== -1) {
        bookshelf.splice(index,1);
        const response = h.response({
            status : 'success',
            message : 'Buku berhasil dihapus',
        });

          response.code(200);
          return response;
    }

    const response = h.response({
        status : 'fail',
        message : 'Buku gagal dihapus. Id tidak ditemukan',
    });

      response.code(404);
      return response;

};

module.exports = {
    addBooksHandler,
    getAllBooksHandler,
    getBooksByIdHandler,
    editBooksHandler,
    deleteBooksHandler,
};