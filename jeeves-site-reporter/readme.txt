=== Jeeves Site Reporter ===
Contributors: assemblestudio
Tags: maintenance, reporting, api, site health, monitoring
Requires at least: 5.6
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Exposes comprehensive WordPress site information via a secure REST API for automated monthly maintenance reports.

== Description ==

Jeeves Site Reporter provides a secure REST API that exposes detailed information about your WordPress installation, making it easy to automate monthly maintenance reports.

= Features =

* **System Information**: PHP version, MySQL version, server software, memory limits, and more
* **Plugins Overview**: Complete list with versions, update status, and activation state
* **Themes Overview**: Installed themes with update availability
* **Database Health**: Table sizes, optimization opportunities, orphaned data
* **Security Audit**: SSL status, file permissions, user security checks
* **Content Statistics**: Posts, pages, media, comments counts
* **Performance Info**: Caching status, cron jobs, Site Health data
* **Updates Log**: Automatic tracking of plugin/theme/core updates

= Security =

All endpoints (except health check) require authentication via API key. The API key is auto-generated on plugin activation and can be regenerated at any time.

= API Endpoints =

* `GET /wp-json/jeeves-reporter/v1/report` - Full site report
* `GET /wp-json/jeeves-reporter/v1/system` - System information
* `GET /wp-json/jeeves-reporter/v1/plugins` - Plugins information
* `GET /wp-json/jeeves-reporter/v1/themes` - Themes information
* `GET /wp-json/jeeves-reporter/v1/database` - Database statistics
* `GET /wp-json/jeeves-reporter/v1/security` - Security audit
* `GET /wp-json/jeeves-reporter/v1/content` - Content statistics
* `GET /wp-json/jeeves-reporter/v1/performance` - Performance info
* `GET /wp-json/jeeves-reporter/v1/updates` - Updates log
* `GET /wp-json/jeeves-reporter/v1/health` - Health check (public)

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/jeeves-site-reporter`
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Go to Tools → Site Reporter to view your API key
4. Use the API key to authenticate requests

== Frequently Asked Questions ==

= How do I authenticate API requests? =

Include the API key either:
* As a header: `X-Jeeves-API-Key: your-api-key`
* As a query parameter: `?api_key=your-api-key`

= Is any data sent externally? =

No. All data stays on your server. The API only responds to authenticated requests.

= Can I regenerate the API key? =

Yes, go to Tools → Site Reporter and click "Regenerate API Key".

== Changelog ==

= 1.0.0 =
* Initial release
