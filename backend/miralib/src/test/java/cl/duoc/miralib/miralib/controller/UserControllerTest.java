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

import cl.duoc.miralib.miralib.dto.User;
import cl.duoc.miralib.miralib.service.UserService;

@WebMvcTest(controllers = UserController.class) 
public class UserControllerTest {

    @Autowired 
    private MockMvc mockMvc;

    @MockitoBean 
    private UserService userService;

    @Test 
    public void testGetAllUsers() throws Exception{
        User usr1 = new User(1, "Exequiel", "exe.guzman@gmail.com", "choma123");
        User usr2 = new User(2, "Felipe", "fe.araya@gmail.com", "kuro123");

        when(userService.getAllUsers()).thenReturn(List.of(usr1, usr2));

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Exequiel"))
                .andExpect(jsonPath("$[1].nombre").value("Felipe"));
    }
    
}
