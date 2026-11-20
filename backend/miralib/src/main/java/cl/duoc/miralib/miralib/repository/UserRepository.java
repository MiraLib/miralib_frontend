package cl.duoc.miralib.miralib.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.miralib.miralib.dto.User;

public interface UserRepository extends JpaRepository <User, Integer> {


    
}
