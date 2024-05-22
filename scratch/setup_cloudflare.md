

# Steps to Set Up Cloudflare

## 1. Create a Cloudflare Account
- **Task:** Go to [Cloudflare's website](https://www.cloudflare.com/) and sign up for an account.
- **Estimated Time:** 5 minutes.

## 2. Add Your Domain to Cloudflare
- **Task:** After logging in, add your domain by entering the domain name when prompted.
- **Estimated Time:** 5 minutes.

## 3. Update DNS Records
- **Task:** Cloudflare will automatically scan and import your domain's existing DNS records. Verify and modify these records to ensure they are correct. Typically, this includes A records for the IP addresses and CNAME records for subdomains.
- **Estimated Time:** 10-15 minutes.

If you do not have a static IP address, your public IP can change. Regularly check and update the A record in Cloudflare if changes occur. Alternatively, consider setting up a dynamic DNS service that automatically updates DNS records when your IP changes.

### Steps to Set Up Dynamic DNS with Cloudflare

1. Gather Required Information
- **Domain Name:** The domain you are using (e.g., `example.com`).
- **Cloudflare Account Email:** Your email associated with Cloudflare.
- **Cloudflare API Key:** From the Cloudflare dashboard, navigate to your profile settings to access your API keys. Obtain the "Global API Key".

2. Install a DDNS Client
- **Option 1:** Utilize an existing DDNS client that supports Cloudflare, such as `ddclient`.
- **Option 2:** Create a script that leverages Cloudflare’s API for DNS updates.

3. Configure the DDNS Client
- For `ddclient`, the configuration might look like this:
  ```bash
  protocol=cloudflare, \
  zone=example.com, \
  login=your-email@example.com, \
  password=your-global-api-key, \
  ttl=1, \
  example.com
    ```

4. Automate Updating the Client with *cron*

Run every 15 minutes
```sh
*/15 * * * * ddclient
```

5. Verify Automation
    - Task: Monitor the updates by checking the ddclient logs or the DNS record in your Cloudflare dashboard.
    - Log Path: Typically found at /var/log/ddclient.log on Linux systems.

## 4. Change Your Nameservers
- **Task:** Replace your domain registrar’s nameservers with the nameservers provided by Cloudflare. This change can take some time (up to 48 hours) to propagate.
- **Estimated Time:** 10 minutes.

## 5. Configure SSL/TLS Encryption
- **Task:** Navigate to the SSL/TLS tab in Cloudflare and select an encryption mode. "Full" or "Full (strict)" is recommended if SSL is already configured on your server.
- **Estimated Time:** 5 minutes.

## 6. Set Up Security Features
- **Task:** Configure additional security settings such as the Web Application Firewall (WAF), rate limiting, and DDoS protection to suit your needs.
- **Estimated Time:** 10-20 minutes.

## 7. Optimize Performance Settings
- **Task:** Enable performance features like caching, minification of JavaScript, CSS, HTML, and Brotli compression based on your site's requirements.
- **Estimated Time:** 10-15 minutes.

## 8. Test Your Configuration
- **Task:** After the DNS changes have propagated and Cloudflare is fully active, test your site’s accessibility and SSL functionality.
- **Tools:** Use tools like `curl` or simply access your website in a browser to verify the SSL certificate.
- **Estimated Time:** 5-10 minutes.

## Monitoring and Maintenance
- **Continuous:** Regularly monitor your site’s performance and security through Cloudflare's analytics dashboard and adjust settings as necessary based on observed traffic patterns and threats.

## Total Estimated Setup Time: Approximately 1-2 hours
