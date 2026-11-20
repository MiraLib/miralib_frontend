package cl.duoc.miralib.miralib.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import cl.duoc.miralib.miralib.dto.Book;
import cl.duoc.miralib.miralib.service.BookService;
import java.time.LocalDate;


@WebMvcTest (controllers = BookController.class) 
public class BookControllerTest {

    
    @Autowired 
    private MockMvc mockMvc;

    @MockitoBean 
    private BookService bookService;

    @Test 
    public void testGetAllBooks() throws Exception{
        Book usr1 = new Book(1, "Agustín", "La metamorfosis", "Frank kafka", "Novela corta", 
        "La historia comienza cuando Gregorio Samsa —un joven viajante de comercio que mantiene económicamente a toda su familia— despierta una mañana tras un sueño intranquilo y descubre que se ha convertido en un monstruoso insecto (similar a un escarabajo gigante). Su primera preocupación no es su terrible condición física, sino el hecho de llegar tarde al trabajo y decepcionar a su jefe"
        , 20, LocalDate.of(2026,12,24));
        Book usr2 = new Book(2, "Valentina", "El Gato Negro", "Edgar Allan Poe", "Terror", 
            "Narra la confesión en prisión de un hombre condenado a muerte que pasa de ser amable y amante de los animales a volverse violento y asesino a causa del alcoholismo y la culpa."
        , 5, LocalDate.of(2027,4,10));

        when(bookService.getAllBooks()).thenReturn(List.of(usr1, usr2));

        mockMvc.perform(get("/api/v1/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombreCompartidor").value("Agustín"))
                .andExpect(jsonPath("$[1].nombreCompartidor").value("Valentina"));
    }

}
