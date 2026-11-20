package cl.duoc.miralib.miralib.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cl.duoc.miralib.miralib.dto.Book;
import cl.duoc.miralib.miralib.repository.BookRepository;

@Service 
public class BookService {

    @Autowired 
    private BookRepository bookRepository;

    public List<Book> getAllBooks(){
        return bookRepository.findAll();
    }

    public Book saveBook(Book b){
        return bookRepository.save(b);
    }

    public Book findById(int id){
        return bookRepository.findById(id).orElse(null);
    }

    public Book sendBook(int id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        if (book.getStock() <= 0) {
            throw new RuntimeException("No se puede dar el libro: stock agotado");
        }

        book.setStock(book.getStock() - 1);
        return bookRepository.save(book);
    }

    public void deleteBook(int id) {
    if (!bookRepository.existsById(id)) {
        throw new RuntimeException("No se encontró el libro con ID: " + id);
    }
        bookRepository.deleteById(id);
}
}


