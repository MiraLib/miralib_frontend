package cl.duoc.miralib.miralib.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Entity 
@Table (name = "books") 
public class Book {

    @Id 
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private int id;
    private String nombreCompartidor;
    private String nombreLibro;
    private String autorLibro;
    private String categoriaLibro;
    private String sipnosisLibro;
    private int stock;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaDeEntrega;

}
