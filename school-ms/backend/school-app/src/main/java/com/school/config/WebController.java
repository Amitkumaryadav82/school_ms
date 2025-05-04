package com.school.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller that forwards all non-API requests to the frontend app
 * This enables client-side routing using React Router
 */
@Controller
public class WebController {

    /**
     * Forward requests to the index.html for client-side routing
     * except for paths matching specified patterns
     */
    @GetMapping(value = {
            "/",
            "/login",
            "/register",
            "/dashboard",
            "/students",
            "/teachers",
            "/courses",
            "/admissions",
            "/reports",
            "/admin",
            "/profile"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }

    /**
     * Catch-all mapping for any other frontend routes not explicitly listed above.
     * Excludes paths that shouldn't be forwarded to index.html
     */
    @GetMapping("/{path:^(?!index\\.html|api|swagger-ui|api-docs|actuator|v3|assets|static|css|js|images|favicon\\.ico|\\.).*$}/**")
    public String forwardRemainingPaths() {
        return "forward:/index.html";
    }
}