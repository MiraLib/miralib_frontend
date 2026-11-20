package cl.duoc.miralib.miralib.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.miralib.miralib.dto.Book;

public interface BookRepository extends JpaRepository <Book, Integer> {

}
