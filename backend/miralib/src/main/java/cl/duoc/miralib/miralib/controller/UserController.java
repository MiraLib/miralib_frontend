package cl.duoc.miralib.miralib.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.miralib.miralib.dto.User;
import cl.duoc.miralib.miralib.service.UserService;

@RestController 
@RequestMapping("/api/v1/users") 
public class UserController {

    @Autowired 
    private UserService userService;
    
    @GetMapping 
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }

    @PostMapping("/add")
    public User saveUser(@RequestBody User u){
        return userService.saveUser(u);
    } 

    @GetMapping("/id")
    public User findById(@RequestParam int id){
        return userService.findById(id);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
    try {
        userService.deleteUser(id);
        return ResponseEntity.ok("Usuario eliminado correctamente");
    } catch (RuntimeException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
}
    
}
