package com.carbontrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_user_id")
    @JsonIgnore  // Prevent LazyInitializationException and circular reference during serialization
    private User adminUser;

    @OneToMany(mappedBy = "organization", fetch = FetchType.LAZY)
    @JsonIgnore  // Prevent N+1 queries and data leakage — use a dedicated endpoint to fetch members
    private List<User> members;
}
