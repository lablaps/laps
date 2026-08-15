package br.uema.laps.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Digests bearer tokens for storage.
 *
 * <p>Invite tokens and email-verification tokens are credentials: presenting one
 * is sufficient to create an account or prove control of an address. Both used
 * to be stored verbatim, so read access to the database — a backup, a replica,
 * a support session, a SELECT-only injection — was enough to redeem them. What
 * is stored now cannot be presented.
 *
 * <p>Plain SHA-256, deliberately: these are 122- and 256-bit random values, so
 * there is no dictionary to defend against and nothing for a slow KDF to buy.
 * That reasoning does not transfer to passwords, which are low-entropy and human
 * -chosen — those stay on BCrypt.
 */
public final class TokenHashing {

    private TokenHashing() {}

    /** Lower-case hex SHA-256 of the token's UTF-8 bytes. Matches the SQL backfill in V24. */
    public static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 unavailable", impossible);
        }
    }

    /**
     * Compares a presented token against a stored digest without an early-exit
     * byte comparison. The tokens involved are far too large to brute-force
     * through a timing side channel, but constant-time comparison is the cheap
     * default and removes the need to re-derive that argument later.
     */
    public static boolean matches(String presentedToken, String storedHash) {
        if (presentedToken == null || storedHash == null) return false;
        return MessageDigest.isEqual(
                hash(presentedToken).getBytes(StandardCharsets.UTF_8),
                storedHash.getBytes(StandardCharsets.UTF_8));
    }
}
