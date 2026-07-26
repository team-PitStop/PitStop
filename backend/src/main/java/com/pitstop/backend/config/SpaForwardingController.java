package com.pitstop.backend.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * US-25: In production the built React app is packaged inside this jar as
 * static files, and React Router owns the URLs below. When the browser asks
 * the server directly for one of them (page refresh, pasted link), there is
 * no real file at that path -- so we hand back index.html and let React
 * Router render the right page client-side.
 *
 * NOTE: if a new top-level route is added in frontend/src/App.jsx, add it here
 * too or refreshing the browser on that page will 404 in production.
 */
@Controller
public class SpaForwardingController {

    @GetMapping({
            "/",
            "/login",
            "/register",
            "/dashboard",
            "/garage",
            "/vehicles/**"
    })
    public String forwardToReact() {
        return "forward:/index.html";
    }
}
