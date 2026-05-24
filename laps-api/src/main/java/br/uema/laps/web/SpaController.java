package br.uema.laps.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Single-page-app fallback. The compiled SPA lives at classpath:/static/ (the
 * Dockerfile copies dist/client/* there during the Maven stage). For any deep
 * link the user lands on (e.g. /team/&lt;uuid&gt; or /projects), the server
 * must hand back index.html so the React router can resolve the route on the
 * client.
 *
 * <p>The route guards intentionally exclude /api/**, /uploads/**,
 * /actuator/** and any path with a dot (so /assets/main-abc.js keeps being
 * served by the static handler with the correct content-type). Everything
 * else — including /, /team, /projects, /contact, /aboutus, /exchange — is
 * forwarded to the SPA shell.
 */
@Controller
public class SpaController {

    @GetMapping(value = {
            "/",
            "/team",
            "/team/{*rest}",
            "/projects",
            "/projects/{*rest}",
            "/contact",
            "/aboutus",
            "/exchange",
            "/login",
            "/admin",
            "/admin/{*rest}",
            "/portal",
            "/portal/{*rest}"
    })
    public String forward(HttpServletRequest req) {
        // forward: preserves the request URI for the client-side router while
        // letting the dispatcher serve /index.html from the static resources.
        return "forward:/index.html";
    }
}
