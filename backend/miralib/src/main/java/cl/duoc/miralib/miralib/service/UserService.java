package cl.duoc.miralib.miralib.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import cl.duoc.miralib.miralib.dto.User;
import cl.duoc.miralib.miralib.repository.UserRepository;

@Service 
public class UserService {

    @Autowired 
    private UserRepository useRepository;
    
    public List<User> getAllUsers(){
        return useRepository.findAll();
    }

    public User saveUser(User u){
        return useRepository.save(u);
    }

    public User findById(int id){
        return useRepository.findById(id).orElse(null);
    }

    public void deleteUser(int id) {
    if (!useRepository.existsById(id)) {
        throw new RuntimeException("No se encontró ese Usuario con esa ID: " + id);
    }
        useRepository.deleteById(id);
}

}
