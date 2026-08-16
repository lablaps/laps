package br.uema.laps.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Locale;

/**
 * Outbound transactional email, over a provider's HTTP API.
 *
 * <p>HTTP rather than SMTP on purpose: the deployment target (Render) gives no
 * guarantee about outbound SMTP ports, and an API key in an environment variable
 * is one less moving part than a mail server's host/port/TLS/credentials tuple.
 * Both supported providers are a single POST with a JSON body.
 *
 * <p>Two providers, selected by {@code laps.email.provider}:
 * <ul>
 *   <li><b>brevo</b> — {@code POST https://api.brevo.com/v3/smtp/email}, key in
 *       the {@code api-key} header. 300 emails/day on the free plan, and a
 *       single <em>sender address</em> can be authorised by clicking a link in a
 *       confirmation email. That last part is why it is the default: it does not
 *       require write access to the uema.br DNS zone.</li>
 *   <li><b>resend</b> — {@code POST https://api.resend.com/emails}, key as a
 *       bearer token. Better developer experience, but it will only deliver to
 *       arbitrary recipients from a <em>domain</em> verified by DNS records; the
 *       shared {@code onboarding@resend.dev} sender reaches the account owner's
 *       own address and nobody else.</li>
 * </ul>
 *
 * <p>With no provider configured the service reports {@link Delivery#NOT_CONFIGURED}
 * and sends nothing. That is not a silent failure — the caller is expected to
 * degrade visibly, because "we could not email the code" and "we emailed the
 * code" have to look different to the member.
 *
 * <p>Nothing here throws. A provider outage must not surface as a 500 on a
 * profile page, and the API key must never reach a log line — hence
 * {@link #redactKey(String)} around everything that gets logged.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private static final String BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
    private static final String RESEND_ENDPOINT = "https://api.resend.com/emails";

    /** Outcome of a send attempt. The caller renders a different UI for each. */
    public enum Delivery {
        /** The provider accepted the message. */
        SENT,
        /** No provider configured — nothing was sent, and nothing was attempted. */
        NOT_CONFIGURED,
        /** A provider is configured but rejected the message or was unreachable. */
        FAILED
    }

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    private final ObjectMapper mapper = new ObjectMapper();

    private final String provider;
    private final String apiKey;
    private final String fromAddress;
    private final String fromName;

    public EmailService(
            @Value("${laps.email.provider:}") String provider,
            @Value("${laps.email.api-key:}") String apiKey,
            @Value("${laps.email.from-address:}") String fromAddress,
            @Value("${laps.email.from-name:LAPS}") String fromName
    ) {
        this.provider = provider == null ? "" : provider.trim().toLowerCase(Locale.ROOT);
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.fromAddress = fromAddress == null ? "" : fromAddress.trim();
        this.fromName = fromName == null || fromName.isBlank() ? "LAPS" : fromName.trim();
    }

    /**
     * Whether a real send is possible right now. All three of provider, key and
     * from-address are required: a provider with no key would 401 on every
     * message, and both APIs reject a missing sender.
     */
    public boolean isEnabled() {
        return (provider.equals("brevo") || provider.equals("resend"))
                && !apiKey.isEmpty()
                && !fromAddress.isEmpty();
    }

    /**
     * Sends the numeric email-verification code.
     *
     * <p>The code is in the subject as well as the body — that is what lets
     * someone read it off a notification without opening the message, and it
     * leaks nothing the body does not already contain.
     */
    public Delivery sendVerificationCode(String toEmail, String toName, String code, Duration validFor) {
        long minutes = Math.max(1, validFor.toMinutes());
        String subject = code + " é o seu código de verificação LAPS";
        String text = """
                Olá%s,

                Seu código de verificação do portal LAPS é:

                    %s

                Ele expira em %d minutos e só pode ser usado uma vez.

                Se você não pediu este código, ignore este email — sua conta
                continua segura e nada foi alterado.

                LAPS — Laboratório de Análise e Processamento de Sinais (UEMA)
                """.formatted(toName == null || toName.isBlank() ? "" : " " + toName, code, minutes);

        return send(toEmail, toName, subject, verificationHtml(toName, code, minutes), text);
    }

    private String verificationHtml(String toName, String code, long minutes) {
        // Inline styles and a table-free single column: every mail client
        // strips <style> blocks differently, and this only has to render one
        // number legibly. The code is also plain selectable text, never an
        // image, so it can be copied on mobile.
        return """
                <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;\
                max-width:480px;margin:0 auto;padding:32px 24px;color:#0f172a">
                  <p style="margin:0 0 8px;font-size:14px;color:#475569">Olá%s,</p>
                  <h1 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0b4e8d">
                    Confirme seu email no portal LAPS
                  </h1>
                  <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#334155">
                    Use o código abaixo para concluir a verificação:
                  </p>
                  <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:8px;\
                text-align:center;color:#0b4e8d;background:#f1f5f9;border-radius:12px;padding:16px">
                    %s
                  </p>
                  <p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#475569">
                    O código expira em <strong>%d minutos</strong> e só pode ser usado uma vez.
                  </p>
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8">
                    Se você não pediu este código, ignore este email — sua conta continua
                    segura e nada foi alterado.
                  </p>
                </div>
                """.formatted(toName == null || toName.isBlank() ? "" : " " + escape(toName), code, minutes);
    }

    private Delivery send(String toEmail, String toName, String subject, String html, String text) {
        if (!isEnabled()) return Delivery.NOT_CONFIGURED;
        if (toEmail == null || toEmail.isBlank()) return Delivery.FAILED;

        try {
            HttpRequest request = switch (provider) {
                case "resend" -> resendRequest(toEmail, subject, html, text);
                default -> brevoRequest(toEmail, toName, subject, html, text);
            };
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 == 2) return Delivery.SENT;
            // The recipient address is the member's own and already in our
            // database, so logging it is not a new disclosure — and without it
            // a bounce is untraceable.
            log.warn("Email send rejected by {} for {}: HTTP {} {}",
                    provider, toEmail, response.statusCode(), redactKey(response.body()));
            return Delivery.FAILED;
        } catch (Exception ex) {
            if (ex instanceof InterruptedException) Thread.currentThread().interrupt();
            log.warn("Email send to {} via {} failed: {}", toEmail, provider, redactKey(ex.toString()));
            return Delivery.FAILED;
        }
    }

    private HttpRequest brevoRequest(String toEmail, String toName, String subject, String html, String text) {
        ObjectNode body = mapper.createObjectNode();
        ObjectNode sender = body.putObject("sender");
        sender.put("name", fromName);
        sender.put("email", fromAddress);
        ArrayNode to = body.putArray("to");
        ObjectNode recipient = to.addObject();
        recipient.put("email", toEmail);
        if (toName != null && !toName.isBlank()) recipient.put("name", toName);
        body.put("subject", subject);
        body.put("htmlContent", html);
        body.put("textContent", text);

        return HttpRequest.newBuilder(URI.create(BREVO_ENDPOINT))
                .timeout(Duration.ofSeconds(10))
                .header("api-key", apiKey)
                .header("content-type", "application/json")
                .header("accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .build();
    }

    private HttpRequest resendRequest(String toEmail, String subject, String html, String text) {
        ObjectNode body = mapper.createObjectNode();
        // Resend takes the sender as a single RFC 5322 string, not a pair.
        body.put("from", "%s <%s>".formatted(fromName, fromAddress));
        body.putArray("to").add(toEmail);
        body.put("subject", subject);
        body.put("html", html);
        body.put("text", text);

        return HttpRequest.newBuilder(URI.create(RESEND_ENDPOINT))
                .timeout(Duration.ofSeconds(10))
                .header("authorization", "Bearer " + apiKey)
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .build();
    }

    /** Providers echo request context in errors; make sure the key is never one of them. */
    private String redactKey(String s) {
        if (s == null) return "";
        String out = apiKey.isEmpty() ? s : s.replace(apiKey, "***");
        return out.length() > 400 ? out.substring(0, 400) + "…" : out;
    }

    private static String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
