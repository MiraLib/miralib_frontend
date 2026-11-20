package cl.duoc.miralib.miralib.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.miralib.miralib.dto.Book;
import cl.duoc.miralib.miralib.service.BookService;

@RestController 
@RequestMapping ("/api/v1/books") 
public class BookController {

    @Autowired 
    private BookService bookService;
    
    @GetMapping 
    public List<Book> getAllBooks(){
        return bookService.getAllBooks();
    }

    @PostMapping("/add")
    public Book saveBook(@RequestBody Book b){
        return bookService.saveBook(b);
    } 

    @GetMapping("/id")
    public Book findById(@RequestParam int id){
        return bookService.findById(id);
    } 
    
    @PutMapping("/send/{id}")
    public ResponseEntity<?> sendBook(@PathVariable int id) {
        try {
            Book libroActualizado = bookService.sendBook(id);
            return ResponseEntity.ok(libroActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable int id) {
    try {
        bookService.deleteBook(id);
        return ResponseEntity.ok("Libro eliminado correctamente");
    } catch (RuntimeException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
}

}
