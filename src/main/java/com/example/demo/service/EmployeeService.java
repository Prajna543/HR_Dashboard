package com.example.demo.service;

import com.example.demo.model.Employee;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class EmployeeService {

    private final Firestore db;

    public EmployeeService(Firestore db) {
        this.db = db;
    }

    // Get all employees from Firestore
    public List<Employee> getAllEmployees() throws ExecutionException, InterruptedException {
        List<Employee> employees = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = db.collection("Employees").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot doc : documents) {
            Employee emp = doc.toObject(Employee.class);
            emp.setId(doc.getId()); // Set Firestore document ID
            employees.add(emp);
        }
        return employees;
    }

    // Add new employee to Firestore
    public void addEmployee(Employee employee) throws ExecutionException, InterruptedException {
        ApiFuture<DocumentReference> future = db.collection("Employees").add(employee);
        future.get(); // wait for operation to complete
    }

    // Get total number of employees
    public int getTotalEmployees() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = db.collection("Employees").get();
        return future.get().size();
    }

    // Get count of employees with status 'Active' (Onboarded)
    public int getOnboardedEmployees() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = db.collection("Employees")
            .whereEqualTo("status", "Active")
            .get();
        return future.get().size();
    }

    // Get count of employees with status 'Pending' or 'Incomplete'
    public int getPendingEmployees() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> futurePending = db.collection("Employees")
            .whereEqualTo("status", "Pending")
            .get();

        ApiFuture<QuerySnapshot> futureIncomplete = db.collection("Employees")
            .whereEqualTo("status", "Incomplete")
            .get();

        return futurePending.get().size() + futureIncomplete.get().size();
    }
}
