package com.example.demo.controller;

import com.example.demo.model.Employee;
import com.example.demo.service.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@CrossOrigin(origins = "*")  // Allows frontend JS calls from any origin
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // GET all employees
    @GetMapping("/employees")
    public List<Employee> getAllEmployees() throws ExecutionException, InterruptedException {
        return employeeService.getAllEmployees();
    }

    // POST a new employee
    @PostMapping("/employees")
    public ResponseEntity<String> addEmployee(@RequestBody Employee employee) {
        try {
            employeeService.addEmployee(employee);
            return ResponseEntity.status(HttpStatus.CREATED).body("Employee added successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding employee");
        }
    }

    // GET dashboard summary data
    @GetMapping("/dashboard/summary")
    public Map<String, Integer> getDashboardSummary() throws ExecutionException, InterruptedException {
        int total = employeeService.getTotalEmployees();
        int onboarded = employeeService.getOnboardedEmployees();
        int pending = employeeService.getPendingEmployees();

        return Map.of(
            "totalEmployees", total,
            "onboardedEmployees", onboarded,
            "pendingEmployees", pending
        );
    }
}
